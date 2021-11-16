import { Request, Response } from 'express';
import IPAddressService from '../../services/ip-address.service';
import { Sudoku } from './models/sudoku';
import PostSubmissionRequest from './requests/submission.post';
import { SudokuResponse, SudokuNotFoundResponse, SudokuInternalServerError } from './response/sudoku.response';
import { SubmitSudokuResponse, SubmitSudokuInternalServerError, SubmitSudokuNotFoundError } from './response/submit-sudoku.response';
import SudokuDynamoDBService from './services/sudoku-dynamodb.service';
import SudokuValidatorService from './services/sudoku-validator.service';
import GetSudokuRequest from './requests/sudoku.get';

class SudokuAPI {
  private static getSubmission(req: Request, sudoku: Sudoku) {
    const ip = IPAddressService.getIPAddress(req);
    return `[IP] ${ip}: [SudokuId] ${sudoku.id}`;
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

      const response: SudokuResponse = {
        sudokuId: sudoku.id,
        puzzle: JSON.parse(sudoku.puzzle),
        submissionId: SudokuAPI.getSubmission(req, sudoku),
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
        valid: SudokuValidatorService.isSudokuSubmissionCorrect(
          sudoku?.puzzle || '',
          sudoku?.solution || '',
          submissionRequest.sudokuSubmission,
        ),
      };

      res.status(200).send(response);
    } catch (e) {
      res.status(500).send(SubmitSudokuInternalServerError((e as Error).message));
    }
  }
}

export default SudokuAPI;
