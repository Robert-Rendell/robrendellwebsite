import { SudokuId } from './sudoku';

export interface Solver {
  solverId: string,
  who: string,
  sudokuId: SudokuId,
  timeTaken: number,
  dateSolved: string,
}
