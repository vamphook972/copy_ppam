import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { Button } from "@/components/atoms";
import { EmptyState, ErrorState, LoadingState } from "@/components/molecules";
import { cn } from "@/lib/utils";

import type { DataTableProps, DataTableSortState } from "./data-table.types";

function getNextSort<TColumnId extends string>(
  currentSort: DataTableSortState<TColumnId> | undefined,
  columnId: TColumnId
): DataTableSortState<TColumnId> {
  if (!currentSort || currentSort.columnId !== columnId) {
    return { columnId, direction: "asc" };
  }

  return {
    columnId,
    direction: currentSort.direction === "asc" ? "desc" : "asc",
  };
}

export function DataTable<TData, TColumnId extends string = string>({
  columns,
  rows,
  getRowId,
  status = "idle",
  loadingLabel = "Loading data",
  emptyTitle = "No data available",
  emptyDescription,
  errorTitle = "Error loading data",
  errorDescription,
  caption,
  className,
  rowActions,
  actionsLabel = "Actions",
  sortableColumns = [],
  sort,
  onSortChange,
  mobileCard,
  pagination,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<TData, TColumnId>) {
  if (status === "loading") {
    return <LoadingState title={loadingLabel} className={className} />;
  }

  if (status === "error") {
    return <ErrorState title={errorTitle} description={errorDescription} className={className} />;
  }

  if (status === "empty" || rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} className={className} />;
  }

  const totalPages = pagination
    ? (pagination.totalPages ??
      Math.max(
        1,
        Math.ceil(
          (pagination.totalItems ?? pagination.total ?? rows.length) /
            Math.max(1, pagination.pageSize)
        )
      ))
    : 1;
  const canGoPrevious = pagination ? (pagination.hasPrevious ?? pagination.page > 1) : false;
  const canGoNext = pagination ? (pagination.hasNext ?? pagination.page < totalPages) : false;
  const paginationLabels = pagination?.labels;

  return (
    <div
      className={cn("bg-card border-border overflow-hidden rounded-xl border shadow-xs", className)}
    >
      {mobileCard ? (
        <div className="grid gap-3 p-4 md:hidden">
          {rows.map((row, index) => (
            <div
              key={getRowId(row, index)}
              className="bg-background border-border rounded-lg border p-4 shadow-2xs"
            >
              {mobileCard(row)}
            </div>
          ))}
        </div>
      ) : null}

      <div className={cn("overflow-x-auto", mobileCard ? "hidden md:block" : undefined)}>
        <table className="text-card-foreground w-full text-left text-sm">
          {caption ? (
            <caption className="text-muted-foreground p-4 text-left font-medium">{caption}</caption>
          ) : null}
          <thead className="bg-muted/40 border-border border-b">
            <tr>
              {columns.map((column) => {
                const columnId = column.id as TColumnId;
                const isSortable = sortableColumns.includes(columnId);
                const isActiveSort = sort?.columnId === columnId;

                return (
                  <th
                    key={column.id}
                    scope="col"
                    className={cn(
                      "text-muted-foreground px-5 py-3.5 text-xs font-bold tracking-wider uppercase",
                      column.headerClassName
                    )}
                  >
                    {isSortable ? (
                      <button
                        type="button"
                        className="hover:text-foreground inline-flex items-center gap-1.5 font-bold uppercase transition-colors"
                        onClick={() => onSortChange?.(getNextSort(sort, columnId))}
                        aria-label={`${String(column.header)} sorting`}
                      >
                        <span>{column.header}</span>
                        {isActiveSort ? (
                          sort?.direction === "asc" ? (
                            <ArrowUp className="text-primary size-3.5" />
                          ) : (
                            <ArrowDown className="text-primary size-3.5" />
                          )
                        ) : (
                          <ArrowUpDown className="size-3.5 opacity-50" />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
              {rowActions ? (
                <th
                  scope="col"
                  className="text-muted-foreground w-0 px-5 py-3.5 text-xs font-bold tracking-wider uppercase"
                >
                  {actionsLabel}
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-border/60 divide-y">
            {rows.map((row, index) => (
              <tr
                key={getRowId(row, index)}
                className="hover:bg-muted/30 align-middle transition-colors"
              >
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={cn(
                      "text-foreground px-5 py-4 text-sm font-medium",
                      column.className
                    )}
                  >
                    {column.cell(row)}
                  </td>
                ))}
                {rowActions ? <td className="w-0 px-5 py-4">{rowActions(row)}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination ? (
        <div className="border-border bg-card flex flex-col gap-3 border-t px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <label className="text-muted-foreground text-xs font-medium" htmlFor="table-page-size">
              {paginationLabels?.rowsPerPage ?? "Rows per page"}
            </label>
            <select
              id="table-page-size"
              className="border-border bg-background text-foreground focus:border-primary focus:ring-primary/20 h-8 rounded-md border px-2.5 text-xs font-semibold focus:ring-2 focus:outline-none"
              value={String(pagination.pageSize)}
              onChange={(event) => onPageSizeChange?.(Number(event.target.value))}
            >
              {(pagination.pageSizeOptions ?? [10, 25, 50]).map((size) => (
                <option key={size} value={String(size)}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-xs font-medium">
              {paginationLabels?.page ?? "Page"} {pagination.page} {paginationLabels?.of ?? "of"}{" "}
              {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-medium"
                disabled={!canGoPrevious}
                onClick={() => onPageChange?.(pagination.page - 1)}
              >
                {paginationLabels?.previous ?? "Previous"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-medium"
                disabled={!canGoNext}
                onClick={() => onPageChange?.(pagination.page + 1)}
              >
                {paginationLabels?.next ?? "Next"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
