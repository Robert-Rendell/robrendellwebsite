import { SudokuId } from './sudoku';
import SudokuPuzzle from './sudoku-puzzle';

export type SubmissionId = string;

export interface Submission {
  submissionId: SubmissionId,
  sudokuId: SudokuId,
  /**
   * Undefined if the system has created it when the puzzle has just been started
   */
  sudokuSubmission: SudokuPuzzle | undefined,
  timeTaken: number,
  dateSubmitted: string,
  ipAddress: string,
}
