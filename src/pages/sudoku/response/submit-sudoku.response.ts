import ErrorResponse from '../../../responses/error.response';
import { SudokuId } from '../models/sudoku';

export interface SubmitSudokuResponse {
  complete: boolean;
  valid: boolean;
}

export type SubmitSudokuErrorResponse = SubmitSudokuResponse & ErrorResponse;

export const SubmitSudokuNotFoundError = (
  sudokuId: SudokuId,
): SubmitSudokuErrorResponse => ({
  errorMessage: `Sudoku was not found: '${sudokuId}'`,
  complete: false,
  valid: false,
});

/**
 * Simple function to handle unexpected errors and spit out error message
 */
export const SubmitSudokuInternalServerError = (
  errorMessage: string,
): SubmitSudokuErrorResponse => ({
  errorMessage,
  complete: false,
  valid: false,
});
