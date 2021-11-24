import PaginationRequest from '../../../requests/pagination.request';
import { ListSudokuParams } from '../services/sudoku-dynamodb.service';

/**
 * The POST request params received from the front end
 */
export interface PostSudokuListRequest extends PaginationRequest {
  filters: ListSudokuParams,
}
