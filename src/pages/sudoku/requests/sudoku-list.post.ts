import PaginationRequest from '../../../requests/pagination.request';
import { ListSudokuParams } from '../models/params/list-sudoku-params';

/**
 * The POST request params received from the front end
 */
export interface PostSudokuListRequest extends PaginationRequest {
  filters: ListSudokuParams,
}
