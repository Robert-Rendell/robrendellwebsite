import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Sudoku } from 'robrendellwebsite-common/src/models/sudoku/sudoku';
import SudokuValidation from 'robrendellwebsite-common/src/models/sudoku/sudoku-validation';
import { ExtendedSubmission, Submission } from 'robrendellwebsite-common/src/models/sudoku/submission';
import {
  GenerateSudokuJson,
  PostGenerateSudokuCallbackRequest,
  PostSudokuListRequest,
  SubmitSudokuBasicResponse,
  SubmitSudokuInternalServerError,
  SubmitSudokuNotFoundError,
  SudokuInternalServerError,
  SudokuLeaderboardResponse,
  SudokuListResponse,
  SudokuNotFoundResponse,
  SudokuPuzzle,
  SudokuResponse,
} from 'robrendellwebsite-common';
import { ListSudokuParams } from 'robrendellwebsite-common/src/models/sudoku/list-sudoku-params';
import GetSudokuRequest from 'robrendellwebsite-common/src/contract/sudoku/request/sudoku.get';
import GetSudokuLeaderboardRequest from 'robrendellwebsite-common/src/contract/sudoku/request/sudoku-leaderboard.get';
import PostSubmissionRequest from 'robrendellwebsite-common/src/contract/sudoku/request/submission.post';
import PostGenerateSudokuRequest from 'robrendellwebsite-common/src/contract/sudoku/request/generate.post';
import GenerateSudokuResponse from 'robrendellwebsite-common/src/contract/sudoku/response/generate.response';
import IPAddressService from '../../services/ip-address.service';
import S3BucketService from '../../services/s3-bucket.service';
import SudokuDynamoDBService from './services/sudoku-dynamodb.service';
import SudokuValidatorService from './services/sudoku-validator.service';
import SubmissionsDynamoDbService from './services/submission-dynamodb.service';
import ConfigService from '../../services/config.service';
import SudokuDifficulty from './enums/sudoku-difficulty';
import { ErrorResponse } from '../../responses/error.response';

class SudokuAPI {
  static Routes = {
    getSudoku: '/sudoku/play/:sudokuId',
    getSudokuLeaderboard: '/sudoku/leaderboard/:sudokuId',
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
    opts?: {
      submissionPuzzle?: SudokuPuzzle,
      validation?: SudokuValidation,
      submitterName?: string,
      timeTakenMs?: number,
    },
  ): Submission {
    const submission: ExtendedSubmission = {
      submissionId: uuidv4(),
      sudokuId: sudoku.sudokuId,
      sudokuSubmission: opts?.submissionPuzzle,
      timeTakenMs: opts?.timeTakenMs || 0,
      dateSubmitted: `${new Date().toISOString()}`,
      ipAddress: `${IPAddressService.getIPAddress(req)}`,
      valid: opts?.validation?.valid,
      complete: opts?.validation?.complete,
      submitterName: opts?.submitterName || '',
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
      console.log(req.body);
      const request = req.body as PostSudokuListRequest;

      const params: ListSudokuParams = {
        generatorJobId: request.filters?.generatorJobId,
      };

      if (request.filters?.dateGenerated) {
        const fromDate = new Date();
        fromDate.setDate(new Date().getDate() - (request.filters.dateGenerated.days || 5));
        params.dateGenerated = {
          to: new Date(),
          from: fromDate,
        };
      }

      let sudokus: Sudoku[] = await SudokuDynamoDBService.listSudokus(params);

      if (request.pagination) {
        sudokus = sudokus.sort(
          (a, b) => (+(new Date(b.dateGenerated)) - +(new Date(a.dateGenerated))),
        ).splice(0, request.pagination.limit || 5);
      }

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
   * GET a sudoku leaderboard using sudokuId
   */
  public static async getSudokuLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      console.log('GET getSudokuLeaderboard');
      const request: GetSudokuLeaderboardRequest = req.params as any;

      const leaderboard = await SubmissionsDynamoDbService.getCompletedSubmissionsForSudoku(
        request.sudokuId,
      );

      const response: SudokuLeaderboardResponse = {
        leaderboard: leaderboard?.filter(
          (item) => item.timeTakenMs,
        ).sort(
          (a, b) => a.timeTakenMs - b.timeTakenMs,
        ) || [],
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
        complete: (sudoku?.solution.replace(/ /g, '') === submissionRequest.sudokuSubmission),
        valid: SudokuValidatorService.isSudokuSubmissionValid(
          sudoku?.puzzle || '',
          submissionRequest.sudokuSubmission,
          sudoku?.solution || '',
        ),
      };

      if (response.complete) {
        const startSubmission = await SubmissionsDynamoDbService.getSubmission(
          submissionRequest.sudokuSubmissionId,
        );
        if (startSubmission?.dateSubmitted) {
          response.timeTakenMs = (+(new Date()) - +(new Date(startSubmission?.dateSubmitted)));
        }
      }

      SudokuAPI.createSubmission(
        req,
        sudoku,
        {
          submissionPuzzle: submissionRequest.sudokuSubmission,
          validation: {
            complete: response.complete,
            valid: response.valid,
          },
          timeTakenMs: response.timeTakenMs,
          submitterName: submissionRequest.submitterName,
        },
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
