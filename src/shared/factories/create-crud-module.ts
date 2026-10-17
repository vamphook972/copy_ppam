import type { FieldValues } from "react-hook-form";
import * as React from "react";

import {
  EntityDetailPage,
  EntityFormPage,
  EntityListPage,
  type EntityDetailPageProps,
  type EntityFormPageProps,
  type EntityListPageProps,
} from "@/components/templates/crud";
import type {
  BaseEntity,
  BaseQueryParams,
  CrudModuleConfig,
} from "@/shared/types/crud-module.types";

import { createCrudApi } from "./create-crud-api";
import { createCrudHooks } from "./create-crud-hooks";

export function createCrudModule<
  TEntity extends BaseEntity & { name?: string },
  TDto,
  TFormValues extends FieldValues,
  TQueryParams extends BaseQueryParams = BaseQueryParams,
  TColumnId extends string = string,
>(config: CrudModuleConfig<TEntity, TDto, TFormValues, TQueryParams, TColumnId>) {
  const api = createCrudApi(config.api);
  const hooks = createCrudHooks<TEntity, TFormValues, TQueryParams>({
    entity: config.entity,
    api,
  });

  const ListView = (props: {
    searchParams?: Record<string, string | string[] | undefined>;
    renderCustomFilters?: (props: {
      state: TQueryParams;
      update: (updates: Partial<TQueryParams>) => void;
    }) => React.ReactNode;
    renderRowActions?: (row: TEntity) => React.ReactNode;
    hideHeader?: boolean;
    hideFilters?: boolean;
    omitColumns?: TColumnId[];
  }) => {
    return React.createElement<
      EntityListPageProps<TEntity, TDto, TFormValues, TQueryParams, TColumnId>
    >(EntityListPage, {
      config,
      hooks,
      searchParams: props.searchParams,
      renderCustomFilters: props.renderCustomFilters,
      renderRowActions: props.renderRowActions,
      hideHeader: props.hideHeader,
      hideFilters: props.hideFilters,
      omitColumns: props.omitColumns,
    });
  };

  const FormView = (props: { mode: "create" | "edit"; id?: string }) => {
    return React.createElement<
      EntityFormPageProps<TEntity, TDto, TFormValues, TQueryParams, TColumnId>
    >(EntityFormPage, {
      config,
      hooks,
      mode: props.mode,
      id: props.id,
    });
  };

  const DetailView = (props: { id: string }) => {
    return React.createElement<
      EntityDetailPageProps<TEntity, TDto, TFormValues, TQueryParams, TColumnId>
    >(EntityDetailPage, {
      config,
      hooks,
      id: props.id,
    });
  };

  return {
    config,
    api,
    hooks,
    permissions: config.permissions,
    ListView,
    FormView,
    DetailView,
  };
}
