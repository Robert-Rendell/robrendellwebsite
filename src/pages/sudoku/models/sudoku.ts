export type SudokuId = string;

export interface Sudoku {
  id: SudokuId,
  puzzle: string,
  solution: string,
  dateGenerated: string,
}
