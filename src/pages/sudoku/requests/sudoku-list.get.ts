import { PaginationRequest } from '../../../requests/pagination.request';

export interface SudokuListFilters {
  solved?: boolean,
  difficulty?: string,
}

/**
 * The GET request params received from the front end
 */
export interface GetSudokuListRequest extends PaginationRequest {
  filters: SudokuListFilters,
}
