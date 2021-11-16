import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import IPAddressService from '../../services/ip-address.service';
import { Sudoku } from './models/sudoku';
import PostSubmissionRequest from './requests/submission.post';
import { SudokuResponse, SudokuNotFoundResponse, SudokuInternalServerError } from './response/sudoku.response';
import { SubmitSudokuResponse, SubmitSudokuInternalServerError, SubmitSudokuNotFoundError } from './response/submit-sudoku.response';
import SudokuDynamoDBService from './services/sudoku-dynamodb.service';
import SudokuValidatorService from './services/sudoku-validator.service';
import GetSudokuRequest from './requests/sudoku.get';
import { Submission } from './models/submission';
import SudokuPuzzle from './models/sudoku-puzzle';
import SubmissionsDynamoDbService from './services/submission-dynamodb.service';

class SudokuAPI {
  private static createSubmission(
    req: Request,
    sudoku: Sudoku,
    submissionPuzzle?: SudokuPuzzle,
  ): Submission {
    const submission: Submission = {
      submissionId: uuidv4(),
      sudokuId: sudoku.id,
      sudokuSubmission: submissionPuzzle,
      timeTaken: 0,
      dateSubmitted: `${new Date()}`,
      ipAddress: `${IPAddressService.getIPAddress(req)}`,
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

      const response: SubmitSudokuResponse = {
        complete: (sudoku?.solution === submissionRequest.sudokuSubmission),
        valid: SudokuValidatorService.isSudokuSubmissionValid(
          sudoku?.puzzle || '',
          submissionRequest.sudokuSubmission,
          sudoku?.solution || '',
        ),
      };

      res.status(200).send(response);
    } catch (e) {
      res.status(500).send(SubmitSudokuInternalServerError((e as Error).message));
    }
  }
}

export default SudokuAPI;
