import { SudokuId } from '../models/sudoku';

/**
 * The GET request params received from the front end
 */
interface GetSudokuRequest {
  sudokuId: SudokuId,
}

export default GetSudokuRequest;
