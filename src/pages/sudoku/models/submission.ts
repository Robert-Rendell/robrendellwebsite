import { SudokuId } from './sudoku';
import SudokuPuzzle from './sudoku-puzzle';
import SudokuValidation from './sudoku-validation';

export type SubmissionId = string;

export interface Submission {
  submissionId: SubmissionId,
  sudokuId: SudokuId,
  /**
   * Undefined if the system has created it when the puzzle has just been started
   */
  sudokuSubmission: SudokuPuzzle | undefined,
  timeTakenMs: number,
  dateSubmitted: string,
  ipAddress: string,
  submitterName: string,
}

export interface ExtendedSubmission extends Partial<SudokuValidation>, Submission {}
