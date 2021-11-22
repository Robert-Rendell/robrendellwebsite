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

class SudokuAPI {
  static Routes = {
    getSudoku: '/sudoku/play/:sudokuId',
    postSubmission: '/sudoku/submit',
    postGenerateSudoku: '/sudoku/add',
    postGenerateSudokuCallback: '/sudoku/add/callback',
  }

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

  static async generateSudoku(req: Request, res: Response): Promise<void> {
    const jsonBody = JSON.stringify({
      difficulty: 'medium',
    });
    S3BucketService.s3.putObject({
      Bucket: ConfigService.SudokuGenerateJsonBucket,
      Key: `${uuidv4()}.json`,
      Body: jsonBody,
    }).promise();
    const response: any = {

    };
    res.status(200).send(response);
  }

  static async generateSudokuCallback(req: Request, res: Response): Promise<void> {
    res.status(200).send({
      roberto: 'all good!',
    });
  }
}

export default SudokuAPI;
