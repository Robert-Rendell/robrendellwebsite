import { SudokuId } from '../models/sudoku';

/**
 * The POST request body received from the front end
 */
interface SubmissionRequest {
  sudokuId: SudokuId,
  sudokuSubmission: string,
  timeTaken: number,
  dateSubmitted: string,
}

export default SubmissionRequest;
