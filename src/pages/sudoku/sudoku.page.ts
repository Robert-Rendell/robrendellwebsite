import { Request, Response } from 'express';
import { Sudoku } from './models/sudoku';
import SudokuResponse from './response/sudoku.response';
import SudokuDynamoDBService from './services/sudoku-dynamodb.service';

class SudokuAPI {
  static async loadSudoku(req: Request, res: Response): Promise<void> {
    const sudoku: Sudoku | undefined | void = await SudokuDynamoDBService.getSudoku(
      req.params.id,
    ).catch((e) => {
      console.error(e);
    });

    const response: SudokuResponse = {
      problem: undefined,
    };

    if (!sudoku) {
      res.status(404).send(response);
      return;
    }

    response.problem = sudoku.puzzle;
    res.status(200).send(response);
  }

  static async validateUserSudoku(req: Request, res: Response): Promise<void> {
    //
  }
}

export default SudokuAPI;
