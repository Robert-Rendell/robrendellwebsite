export interface Pagination {
  page: number;
  limit: number;
}

export interface PaginationRequest {
  pagination: Pagination,
}
