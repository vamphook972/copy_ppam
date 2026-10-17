type SortDirection = "asc" | "desc";

export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  sort?: string;
  direction?: SortDirection;
  [key: string]: unknown;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    pagination: PaginationMeta;
    correlationId?: string;
  };
}

export interface BaseResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    correlationId?: string;
  };
}
