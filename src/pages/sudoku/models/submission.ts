import { SudokuId } from './sudoku';

export type SubmissionId = string;

/**
 * The DynamoDB object
 */
export interface Submission {
  id: SubmissionId,
  sudoku: SudokuId,
  sudokuSubmission: number[][],
  timeTaken: number,
  dateSubmitted: string,
}
