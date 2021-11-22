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

class SudokuAPI {
  static Routes = {
    getSudoku: '/sudoku/play/:sudokuId',
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
      sudokuId: sudoku.id,
      sudokuSubmission: submissionPuzzle,
      timeTaken: 0,
      dateSubmitted: `${new Date()}`,
      ipAddress: `${IPAddressService.getIPAddress(req)}`,
      valid: validation?.valid,
      complete: validation?.complete,
      submitterName: submitterName || '',
    };
    SubmissionsDynamoDbService.saveSubmission(submission);
    return submission;
  }

  /**
   * GET a single sudoku using sudokuId
   */
  static async getSudoku(req: Request, res: Response): Promise<void> {
    try {
      console.log('GET getSudoku');
      const sudokuRequest: GetSudokuRequest = req.params as any;

      const sudoku: Sudoku | undefined | void = await SudokuDynamoDBService.getSudoku(
        sudokuRequest.sudokuId,
      ).catch((e) => {
        console.error(e);
      });

      if (!sudoku) {
        res.status(404).send(SudokuNotFoundResponse(sudokuRequest.sudokuId));
        return;
      }

      const submission = SudokuAPI.createSubmission(req, sudoku);

      const response: SudokuResponse = {
        sudokuId: sudoku.id,
        puzzle: JSON.parse(sudoku.puzzle),
        submissionId: submission.submissionId,
      };

      res.status(200).send(response);
    } catch (e) {
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
      res.status(500).send(SubmitSudokuInternalServerError((e as Error).message));
    }
  }

  /**
   * POST Endpoint to trigger the Python Lambda for sudoku generation
   */
  static async generateSudoku(req: Request, res: Response): Promise<void> {
    console.log('POST generateSudoku');
    console.log(req.params, req.body);

    if (req.body.roberto !== 'testing') {
      const errorMessage = 'Error: Testing flag not set in message body: { "roberto": "testing" }';
      console.error(errorMessage);
      res.status(400).send({ errorMessage } as ErrorResponse);
      return;
    }

    const difficulty = req.body.difficulty || SudokuDifficulty.Medium;
    if (!Object.values(SudokuDifficulty).includes(difficulty)) {
      const errorMessage = `Error: Sudoku generation difficulty not recognised: '${difficulty}'`;
      console.error(errorMessage);
      res.status(400).send({ errorMessage } as ErrorResponse);
      return;
    }

    if (ConfigService.FeatureFlags.sudokuGenerationEnabled) {
      const jsonBody = JSON.stringify({ difficulty });
      console.log(`Triggering Sudoku Generation Lambda (Difficulty: ${difficulty})`);
      S3BucketService.s3.putObject({
        Bucket: ConfigService.SudokuGenerateJsonBucket,
        Key: `${uuidv4()}.json`,
        Body: jsonBody,
      }).promise();
      const response: any = {};
      res.status(200).send(response);
      return;
    }

    const info = 'Sudoku Generation feature disabled, so lambda was not invoked.';
    console.log(info);
    res.status(200).send({ info });
  }

  static async generateSudokuCallback(req: Request, res: Response): Promise<void> {
    console.log('POST generateSudokuCallback');
    console.log(req.params, req.body);
    res.status(200).send({
      roberto: 'all good!',
    });
  }
}

export default SudokuAPI;
