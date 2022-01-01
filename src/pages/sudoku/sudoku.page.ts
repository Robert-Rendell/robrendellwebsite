import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import IPAddressService from '../../services/ip-address.service';
import S3BucketService from '../../services/s3-bucket.service';
import SudokuDynamoDBService from './services/sudoku-dynamodb.service';
import SudokuValidatorService from './services/sudoku-validator.service';
import SubmissionsDynamoDbService from './services/submission-dynamodb.service';
import ConfigService from '../../services/config.service';
import { Sudoku } from './models/sudoku';
import PostSubmissionRequest from './requests/submission.post';
import { SudokuResponse, SudokuNotFoundResponse, SudokuInternalServerError } from './response/sudoku.response';
import { SubmitSudokuBasicResponse, SubmitSudokuInternalServerError, SubmitSudokuNotFoundError } from './response/submit-sudoku.response';
import GetSudokuRequest from './requests/sudoku.get';
import { ExtendedSubmission, Submission } from './models/submission';
import SudokuPuzzle from './models/sudoku-puzzle';
import SudokuValidation from './models/sudoku-validation';
import SudokuDifficulty from './enums/sudoku-difficulty';
import ErrorResponse from '../../responses/error.response';
import PostGenerateSudokuRequest from './requests/generate.post';
import GenerateSudokuResponse from './response/generate.response';
import PostGenerateSudokuCallbackRequest from './requests/generate-callback.post';
import GenerateSudokuJson from './models/generate-sudoku-json';
import { PostSudokuListRequest } from './requests/sudoku-list.post';
import { SudokuListResponse } from './response/sudoku-list.response';

class SudokuAPI {
  static Routes = {
    getSudoku: '/sudoku/play/:sudokuId',
    postSudokuList: '/sudoku/list',
    postSubmission: '/sudoku/submit',
    postGenerateSudoku: '/sudoku/add',
    postGenerateSudokuCallback: '/sudoku/add/callback',
  }

  /**
   * Use DynamoDB Service to create a sudoku submission in DynamoDB
   */
  private static createSubmission(
    req: Request,
    sudoku: Sudoku,
    submissionPuzzle?: SudokuPuzzle,
    validation?: SudokuValidation,
    submitterName?: string,
  ): Submission {
    const submission: ExtendedSubmission = {
      submissionId: uuidv4(),
      sudokuId: sudoku.sudokuId,
      sudokuSubmission: submissionPuzzle,
      timeTaken: 0,
      dateSubmitted: `${new Date().toISOString()}`,
      ipAddress: `${IPAddressService.getIPAddress(req)}`,
      valid: validation?.valid,
      complete: validation?.complete,
      submitterName: submitterName || '',
    };
    SubmissionsDynamoDbService.saveSubmission(submission);
    return submission;
  }

  /**
   * POST a list of sudokus using filters
   */
  static async postSudokuList(req: Request, res: Response): Promise<void> {
    try {
      console.log('POST postSudokuList');
      const request = req.body as PostSudokuListRequest;

      const sudokus: Sudoku[] = await SudokuDynamoDBService.listSudokus({
        generatorJobId: request.filters?.generatorJobId,
      });

      console.log(sudokus);
      res.status(200).send(sudokus as SudokuListResponse);
    } catch (e) {
      console.error(e);
      res.status(500).send(SudokuInternalServerError((e as Error).message));
    }
  }

  /**
   * GET a single sudoku using sudokuId
   */
  static async getSudoku(req: Request, res: Response): Promise<void> {
    try {
      console.log('GET getSudoku');
      const request: GetSudokuRequest = req.params as any;

      const sudoku: Sudoku | undefined | void = await SudokuDynamoDBService.getSudoku(
        request.sudokuId,
      ).catch((e) => {
        console.error(e);
      });

      if (!sudoku) {
        res.status(404).send(SudokuNotFoundResponse(request.sudokuId));
        return;
      }

      const submission = SudokuAPI.createSubmission(req, sudoku);

      const response: SudokuResponse = {
        sudokuId: sudoku.sudokuId,
        puzzle: JSON.parse(sudoku.puzzle),
        submissionId: submission.submissionId,
      };

      res.status(200).send(response);
    } catch (e) {
      console.error(e);
      res.status(500).send(SudokuInternalServerError((e as Error).message));
    }
  }

  /**
   * POST Submit a partial or complete solution to a sudoku puzzle
   */
  static async postSubmission(req: Request, res: Response): Promise<void> {
    try {
      console.log('POST postSubmission');
      console.log(req.body);
      const submissionRequest: PostSubmissionRequest = req.body;

      const sudoku: Sudoku | undefined | void = await SudokuDynamoDBService.getSudoku(
        submissionRequest.sudokuId,
      ).catch((e) => {
        console.error(e);
      });

      if (!sudoku) {
        res.status(404).send(SubmitSudokuNotFoundError(submissionRequest.sudokuId));
        return;
      }

      const response: SubmitSudokuBasicResponse = {
        complete: (sudoku?.solution === submissionRequest.sudokuSubmission),
        valid: SudokuValidatorService.isSudokuSubmissionValid(
          sudoku?.puzzle || '',
          submissionRequest.sudokuSubmission,
          sudoku?.solution || '',
        ),
      };

      SudokuAPI.createSubmission(
        req,
        sudoku,
        submissionRequest.sudokuSubmission,
        response,
      );

      res.status(200).send(response);
    } catch (e) {
      console.error(e);
      res.status(500).send(SubmitSudokuInternalServerError((e as Error).message));
    }
  }

  /**
   * POST Endpoint to trigger the Python Lambda for sudoku generation
   */
  static async generateSudoku(req: Request, res: Response): Promise<void> {
    console.log('POST generateSudoku');
    console.log(req.params, req.body);
    const request = req.body as PostGenerateSudokuRequest;

    if (request.roberto !== 'testing') {
      SudokuAPI.badRequest('Error: Testing flag not set in message body: { "roberto": "testing" }', res);
      return;
    }

    const difficulty = request.difficulty || 'not specified';
    if (!Object.values<string>(SudokuDifficulty).includes(difficulty)) {
      SudokuAPI.badRequest(`Error: Sudoku generation difficulty not recognised: '${difficulty}'`, res);
      return;
    }

    if (!ConfigService.FeatureFlags.sudokuGenerationEnabled) {
      const info = 'Sudoku Generation feature disabled, so lambda was not invoked.';
      console.log(info);
      res.status(200).send({ info });
      return;
    }

    const generationJobId = uuidv4();
    const generateSudokuJson: GenerateSudokuJson = {
      difficulty,
      generatorIPAddress: `${IPAddressService.getIPAddress(req)}`,
      generatorUserName: request.generatorUserName || 'anonymous',
      generationJobId,
    };
    console.log(`Triggering sudoku generation lambda (Difficulty: ${difficulty})`);
    S3BucketService.s3.putObject({
      Bucket: ConfigService.SudokuGenerateJsonBucket,
      Key: `${generationJobId}.json`,
      Body: JSON.stringify(generateSudokuJson),
    }).promise();
    const response: GenerateSudokuResponse = { generationJobId };
    res.status(200).send(response);
  }

  static async generateSudokuCallback(req: Request, res: Response): Promise<void> {
    console.log('POST generateSudokuCallback');
    console.log(req.params, req.body);
    const request = req.body as PostGenerateSudokuCallbackRequest;

    if (request.sudokuInsertionSecurityKey !== ConfigService.SudokuGenSecurityKey) {
      SudokuAPI.unauthorised("Error: SUDOKU_GEN_SECURITY_KEY env var not matching for 'sudokuInsertionSecurityKey' in body", res);
      return;
    }
    if (!(request.puzzle && request.solution && request.difficulty)) {
      SudokuAPI.badRequest("Error: Need to specify 'puzzle', 'solution' and 'difficulty'", res);
      return;
    }

    if (!ConfigService.FeatureFlags.sudokuGenerationEnabled) {
      const info = 'Sudoku Generation feature disabled, so sudoku was not created.';
      console.log(info);
      res.status(200).send({ info });
      return;
    }

    try {
      // Could do this whole step before the lambda executes and just update it.
      const sudokuId = uuidv4();
      console.log(`Inserting sudoku into db: ${sudokuId}`);
      SudokuDynamoDBService.saveSudoku({
        sudokuId,
        puzzle: request.puzzle,
        solution: request.solution,
        dateGenerated: `${new Date().toISOString()}`,
        clues: request.clues,
        difficulty: request.difficulty,
        generatorIPAddress: request.generatorIPAddress,
        generatorUserName: request.generatorUserName,
        generationJobId: request.generationJobId,
      });
      // Don't really care what is sent back to the lambda
      res.status(200).send({});
    } catch (e) {
      console.error(e);
      res.status(500).send({ errorMessage: e } as ErrorResponse);
    }
  }

  static badRequest(errorMessage: string, res: Response): void {
    console.error(errorMessage);
    res.status(400).send({ errorMessage } as ErrorResponse);
  }

  static unauthorised(errorMessage: string, res: Response): void {
    console.error(errorMessage);
    res.status(401).send({ errorMessage } as ErrorResponse);
  }
}

export default SudokuAPI;
