"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/atoms";
import { FilterField } from "@/components/molecules/filter-field";
import { PageActions } from "@/components/molecules/page-actions";
import { PageHeader } from "@/components/molecules/page-header";
import { DataTable } from "@/components/organisms/data-table";
import { DeleteDialog } from "@/components/organisms/delete-dialog";
import { EntityRowActions } from "@/components/organisms/entity-row-actions";
import { FiltersPanel } from "@/components/organisms/filters-panel";
import { useUrlState } from "@/hooks/use-url-state";
import type {
  BaseEntity,
  BaseQueryParams,
  CrudHooks,
  CrudModuleConfig,
} from "@/shared/types/crud-module.types";

export interface EntityListPageProps<
  TEntity extends BaseEntity & { name?: string },
  TDto,
  TFormValues,
  TQueryParams extends BaseQueryParams = BaseQueryParams,
  TColumnId extends string = string,
> {
  config: CrudModuleConfig<TEntity, TDto, TFormValues, TQueryParams, TColumnId>;
  hooks: CrudHooks<TEntity, TFormValues, TQueryParams>;
  searchParams?: Record<string, string | string[] | undefined>;
  renderCustomFilters?: (props: {
    state: TQueryParams;
    update: (updates: Partial<TQueryParams>) => void;
  }) => React.ReactNode;
  renderRowActions?: (row: TEntity) => React.ReactNode;
  hideHeader?: boolean;
  hideFilters?: boolean;
  omitColumns?: TColumnId[];
}

export function EntityListPage<
  TEntity extends BaseEntity & { name?: string },
  TDto,
  TFormValues,
  TQueryParams extends BaseQueryParams = BaseQueryParams,
  TColumnId extends string = string,
>({
  config,
  hooks,
  searchParams = {},
  renderCustomFilters,
  renderRowActions,
  hideHeader = false,
  hideFilters = false,
  omitColumns = [],
}: EntityListPageProps<TEntity, TDto, TFormValues, TQueryParams, TColumnId>) {
  const t = useTranslations(config.translationNamespace as Parameters<typeof useTranslations>[0]);
  const commonT = useTranslations("common");

  // Initial defaults for search params
  const defaultQueryParams = React.useMemo(() => {
    const defaults: Record<string, string | number | undefined> = {
      page: 1,
      pageSize: 25,
      search: "",
    };

    if (config.table.defaultSort) {
      defaults.sort = config.table.defaultSort.columnId;
      defaults.direction = config.table.defaultSort.direction;
    }

    if (config.filters) {
      config.filters.forEach((f) => {
        defaults[f.name] = undefined;
      });
    }

    // Merge searchParams passed directly as props (e.g. from parent component / sub-module embedding)
    Object.entries(searchParams).forEach(([key, val]) => {
      if (val !== undefined) {
        defaults[key] = Array.isArray(val) ? val[0] : val;
      }
    });

    return defaults as TQueryParams;
  }, [config.table.defaultSort, config.filters, searchParams]);

  const { state: urlState, update: updateQueryParams } =
    useUrlState<TQueryParams>(defaultQueryParams);

  const activeQuery = React.useMemo(() => {
    const merged: Record<string, unknown> = { ...urlState };
    Object.entries(searchParams).forEach(([key, val]) => {
      if (val !== undefined) {
        merged[key] = Array.isArray(val) ? val[0] : val;
      }
    });
    return merged as TQueryParams;
  }, [urlState, searchParams]);

  const listQuery = hooks.useList(activeQuery);
  const deleteMutation = hooks.useDelete();

  const [selectedEntityForDelete, setSelectedEntityForDelete] = React.useState<TEntity | null>(
    null
  );

  const rows = listQuery.data?.items ?? [];
  const pagination = listQuery.data?.pagination ?? {
    page: Number(activeQuery.page) || 1,
    pageSize: Number(activeQuery.pageSize) || 25,
    totalItems: rows.length,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
    total: rows.length,
  };

  const tableStatus = listQuery.isPending
    ? "loading"
    : listQuery.isError
      ? "error"
      : rows.length === 0
        ? "empty"
        : "success";

  const handleFilterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const updates: Record<string, string | number | undefined> = { page: 1 };

    if (config.filters) {
      config.filters.forEach((f) => {
        const val = formData.get(f.name)?.toString().trim();
        updates[f.name] = val === "all" || !val ? undefined : val;
      });
    }

    updateQueryParams(updates as Partial<TQueryParams>);
  };

  const handleDelete = async () => {
    if (!selectedEntityForDelete) return;
    try {
      await deleteMutation.mutateAsync(selectedEntityForDelete.id);
      setSelectedEntityForDelete(null);
    } catch {
      // Error handling by query mutation or toast
    }
  };

  // Convert table columns to DataTable format
  const dataTableColumns = React.useMemo(() => {
    return config.table.columns
      .filter((col) => !omitColumns.includes(col.id))
      .map((col) => ({
        id: col.id,
        header:
          col.header ??
          (col.translationKey
            ? t(col.translationKey as Parameters<typeof t>[0])
            : t(`table.columns.${col.id}` as Parameters<typeof t>[0])),
        cell: col.cell,
        headerClassName: col.headerClassName,
        className: col.className,
      }));
  }, [config.table.columns, omitColumns, t]);

  const primaryAction = config.permissions.create
    ? {
        id: "create",
        label: t("primaryAction" as Parameters<typeof t>[0]),
        href: `${config.basePath}/new`,
        permission: config.permissions.create,
      }
    : undefined;

  return (
    <main className="space-y-6">
      {/* Header */}
      {!hideHeader && (
        <PageHeader
          title={t("title" as Parameters<typeof t>[0])}
          subtitle={t("subtitle" as Parameters<typeof t>[0])}
          actions={primaryAction ? <PageActions primaryAction={primaryAction} /> : null}
        />
      )}

      {/* Filters */}
      {!hideFilters && (config.filters || renderCustomFilters) && (
        <FiltersPanel
          title={t("filters.title" as Parameters<typeof t>[0])}
          description={t("filters.description" as Parameters<typeof t>[0])}
        >
          <form onSubmit={handleFilterSubmit} className="col-span-full grid gap-4 md:grid-cols-2">
            <div className="col-span-full grid gap-4 md:grid-cols-2">
              {config.filters?.map((filter) => (
                <FilterField
                  key={filter.name}
                  config={filter}
                  value={(activeQuery as Record<string, unknown>)[filter.name]}
                  onChange={(val) =>
                    updateQueryParams({ [filter.name]: val, page: 1 } as Partial<TQueryParams>)
                  }
                  translationNamespace={config.translationNamespace}
                />
              ))}

              {renderCustomFilters?.({
                state: activeQuery,
                update: (updates) => updateQueryParams({ ...updates, page: 1 }),
              })}
            </div>

            <div className="col-span-full flex justify-end">
              <Button type="submit" className="w-full md:w-auto md:min-w-36">
                {t("filters.apply" as Parameters<typeof t>[0])}
              </Button>
            </div>
          </form>
        </FiltersPanel>
      )}

      {/* Data Table */}
      <DataTable
        caption={t("table.caption" as Parameters<typeof t>[0])}
        columns={dataTableColumns}
        rows={rows}
        getRowId={(row: TEntity) => row.id}
        status={tableStatus}
        loadingLabel={t("states.loading" as Parameters<typeof t>[0])}
        emptyTitle={t("states.emptyTitle" as Parameters<typeof t>[0])}
        emptyDescription={t("states.emptyDescription" as Parameters<typeof t>[0])}
        errorTitle={t("states.errorTitle" as Parameters<typeof t>[0])}
        errorDescription={t("states.errorDescription" as Parameters<typeof t>[0])}
        sortableColumns={config.table.sortableColumns ?? []}
        sort={
          activeQuery.sort
            ? {
                columnId: String(activeQuery.sort),
                direction: activeQuery.direction === "desc" ? "desc" : "asc",
              }
            : undefined
        }
        onSortChange={(nextSort) =>
          updateQueryParams({
            sort: nextSort.columnId,
            direction: nextSort.direction,
            page: 1,
          } as Partial<TQueryParams>)
        }
        mobileCard={config.table.mobileCard}
        rowActions={
          config.actions && config.actions.length > 0
            ? (row: TEntity) => (
                <EntityRowActions
                  row={row}
                  actions={config.actions}
                  basePath={config.basePath}
                  translationNamespace={config.translationNamespace}
                  onDeleteRequest={(r) => setSelectedEntityForDelete(r)}
                  onRefresh={() => void listQuery.refetch()}
                  renderRowActions={renderRowActions}
                />
              )
            : undefined
        }
        pagination={{
          page: pagination.page,
          pageSize: pagination.pageSize,
          totalItems: pagination.totalItems,
          totalPages: pagination.totalPages,
          hasNext: pagination.hasNext,
          hasPrevious: pagination.hasPrevious,
          total: pagination.totalItems ?? pagination.total,
          pageSizeOptions: config.table.pageSizeOptions,
          labels: {
            previous: commonT("pagination.previous"),
            next: commonT("pagination.next"),
            page: commonT("pagination.page"),
            of: commonT("pagination.of"),
            rowsPerPage: commonT("pagination.rowsPerPage"),
          },
        }}
        onPageChange={(page) => updateQueryParams({ page } as Partial<TQueryParams>)}
        onPageSizeChange={(pageSize) =>
          updateQueryParams({ pageSize, page: 1 } as Partial<TQueryParams>)
        }
      />

      {/* Delete Confirmation */}
      <DeleteDialog
        entity={selectedEntityForDelete}
        translationNamespace={config.translationNamespace}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setSelectedEntityForDelete(null)}
      />
    </main>
  );
}
