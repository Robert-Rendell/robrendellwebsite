import { SudokuId } from './sudoku';

export interface Solver {
  id: string,
  who: string,
  sudoku: SudokuId,
  timeTaken: number,
  dateSolved: string,
}
