import SudokuPuzzle from '../models/sudoku-puzzle';

interface PostGenerateSudokuCallbackRequest {
  puzzle: SudokuPuzzle,
  solution: SudokuPuzzle,
  difficulty: string,
  clues: number,
  /**
   * Daisy chained currently from lambda invocation
   */
  generatorIPAddress: string,
  /**
   * Daisy chained currently from lambda invocation
   */
  generatorUserName: string,
  /**
   * Daisy chained currently from lambda invocation
   */
  generationJobId: string,
  /**
   * The lambda and the back end share a security key for sudoku adding
   */
  sudokuInsertionSecurityKey: string,
}

export { PostGenerateSudokuCallbackRequest as default };
