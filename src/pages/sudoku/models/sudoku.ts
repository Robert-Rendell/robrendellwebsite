export type SudokuId = string;

export interface Sudoku {
  sudokuId: SudokuId,
  puzzle: string,
  solution: string,
  dateGenerated: string,
  clues: number,
  difficulty: string,
  generatorIPAddress: string,
  generatorUserName: string,
  generationJobId: string,
}
