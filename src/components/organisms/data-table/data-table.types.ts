import type { ReactNode } from "react";

export type DataTableStatus = "idle" | "loading" | "empty" | "error" | "success";

export interface DataTableColumn<TData> {
  id: string;
  header: ReactNode;
  cell: (row: TData) => ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DataTablePagination {
  page: number;
  pageSize: number;
  totalItems?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
  total?: number;
  pageSizeOptions?: number[];
  labels?: {
    previous: string;
    next: string;
    page: string;
    of: string;
    rowsPerPage: string;
  };
}

export interface DataTableSortState<TColumnId extends string = string> {
  columnId: TColumnId;
  direction: "asc" | "desc";
}

export interface DataTableProps<TData, TColumnId extends string = string> {
  columns: DataTableColumn<TData>[];
  rows: TData[];
  getRowId: (row: TData, index: number) => string;
  status?: DataTableStatus;
  loadingLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  errorTitle?: string;
  errorDescription?: string;
  caption?: string;
  className?: string;
  rowActions?: (row: TData) => ReactNode;
  actionsLabel?: string;
  mobileCard?: (row: TData) => ReactNode;
  sortableColumns?: TColumnId[];
  sort?: DataTableSortState<TColumnId>;
  onSortChange?: (nextSort: DataTableSortState<TColumnId>) => void;
  pagination?: DataTablePagination;
  onPageChange?: (nextPage: number) => void;
  onPageSizeChange?: (nextPageSize: number) => void;
}
