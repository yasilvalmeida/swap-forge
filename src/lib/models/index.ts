export type DimensionDto = {
  width: number;
  height: number;
};

export type ErrorResponseDto = {
  error: string;
};

export type SuccessResponseDto = {
  message: string;
};

export type PaginationDtoRequest = {
  paged?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: string;
};

export interface IUsePaginationRequest {
  totalCount: number;
  limit: number;
  siblingCount: number;
  offset: number;
}

export interface IUsePaginationResponse {
  groups: number;
  ranges: (number | string)[];
}