import { SudokuId } from '../models/sudoku';

/**
 * The POST request body received from the front end
 */
interface PostSubmissionRequest {
  sudokuId: SudokuId,
  sudokuSubmission: string,
  sudokuSubmissionId: string,
  timeTaken: number,
  dateSubmitted: string,
  submitterName: string,
}

export default PostSubmissionRequest;
