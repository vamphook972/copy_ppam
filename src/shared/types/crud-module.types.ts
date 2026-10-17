import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import type { ZodType } from "zod";
import type { ReactNode } from "react";

import type { Permission } from "@/config/permissions";
import type { ComboboxOption } from "@/components/ui/combobox";

import type { Pagination } from "./api";

// ----------------------------------------------------------------------
// Base Entities & Queries
// ----------------------------------------------------------------------

export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BaseQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  direction?: "asc" | "desc";
  [key: string]: unknown;
}

export interface ListResponse<TEntity> {
  items: TEntity[];
  pagination: Pagination;
}

// ----------------------------------------------------------------------
// Permissions
// ----------------------------------------------------------------------

export interface ModulePermissions {
  read: Permission;
  create?: Permission;
  update?: Permission;
  delete?: Permission;
  custom?: Record<string, Permission>;
}

// ----------------------------------------------------------------------
// API Configuration
// ----------------------------------------------------------------------

export interface CrudApiConfig<
  TEntity extends BaseEntity,
  TDto,
  TFormValues,
  TQueryParams extends BaseQueryParams = BaseQueryParams,
> {
  endpoint: string;
  defaultParams?: Partial<TQueryParams>;
  mapDtoToEntity: (dto: TDto) => TEntity;
  list?: (params: TQueryParams) => Promise<ListResponse<TEntity>>;
  getById?: (id: string) => Promise<TEntity>;
  create?: (input: TFormValues) => Promise<TEntity>;
  update?: (id: string, input: Partial<TFormValues>) => Promise<TEntity>;
  remove?: (id: string) => Promise<void>;
}

export interface CrudApiMethods<
  TEntity extends BaseEntity,
  TFormValues,
  TQueryParams extends BaseQueryParams = BaseQueryParams,
> {
  list: (params: TQueryParams) => Promise<ListResponse<TEntity>>;
  getById: (id: string) => Promise<TEntity>;
  create: (input: TFormValues) => Promise<TEntity>;
  update: (id: string, input: Partial<TFormValues>) => Promise<TEntity>;
  remove: (id: string) => Promise<void>;
}

// ----------------------------------------------------------------------
// Table Configuration
// ----------------------------------------------------------------------

export interface ColumnConfig<TEntity, TColumnId extends string = string> {
  id: TColumnId;
  header?: ReactNode;
  translationKey?: string;
  cell: (row: TEntity) => ReactNode;
  headerClassName?: string;
  className?: string;
}

export interface TableConfig<TEntity, TColumnId extends string = string> {
  columns: ColumnConfig<TEntity, TColumnId>[];
  sortableColumns?: TColumnId[];
  defaultSort?: { columnId: TColumnId; direction: "asc" | "desc" };
  pageSizeOptions?: number[];
  mobileCard?: (row: TEntity) => ReactNode;
}

// ----------------------------------------------------------------------
// Relation & Form Field Configuration
// ----------------------------------------------------------------------

export interface RelationConfig<TItem = unknown> {
  endpoint: string;
  queryParams?: Record<string, string | number | boolean | null | undefined>;
  mapToOption: (item: TItem) => ComboboxOption;
  searchParam?: string;
  dependsOn?: {
    field: string;
    paramName: string;
  };
}

export interface RelationFieldConfig {
  type: "relation";
  name: string;
  label?: string;
  required?: boolean;
  gridSpan?: 1 | 2;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  relation: RelationConfig<any>;
}

export interface TextFieldConfig {
  type: "text" | "email" | "number" | "password" | "phone";
  name: string;
  countryCodeName?: string;
  defaultCountryCode?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  gridSpan?: 1 | 2;
}

export interface SelectFieldConfig {
  type: "select";
  name: string;
  label?: string;
  options: { value: string; translationKey: string }[];
  required?: boolean;
  gridSpan?: 1 | 2;
}

export interface SwitchFieldConfig {
  type: "switch";
  name: string;
  label?: string;
  gridSpan?: 1 | 2;
}

export interface DateFieldConfig {
  type: "date";
  name: string;
  label?: string;
  required?: boolean;
  gridSpan?: 1 | 2;
}

export interface CustomFieldConfig {
  type: "custom";
  name: string;
  render: (props: {
    value: unknown;
    onChange: (val: unknown) => void;
    error?: string;
  }) => ReactNode;
  gridSpan?: 1 | 2;
}

export type FormFieldConfig =
  | TextFieldConfig
  | SelectFieldConfig
  | RelationFieldConfig
  | SwitchFieldConfig
  | DateFieldConfig
  | CustomFieldConfig;

export interface FormRenderProps<TEntity, TFormValues> {
  mode: "create" | "edit";
  initialValues?: TEntity;
  onSubmit: (values: TFormValues) => Promise<void>;
  isSubmitting: boolean;
  onCancel?: () => void;
}

export interface FormConfig<TEntity, TFormValues> {
  schema: ZodType<TFormValues>;
  defaultValues: TFormValues | ((entity?: TEntity) => TFormValues);
  fields?: FormFieldConfig[];
  renderForm?: (props: FormRenderProps<TEntity, TFormValues>) => ReactNode;
}

// ----------------------------------------------------------------------
// Detail Configuration
// ----------------------------------------------------------------------

export type DetailLayoutMode = "stack" | "tabs";

export interface DetailFieldConfig<TEntity> {
  key: keyof TEntity | string;
  label: string;
  render?: (value: unknown, entity: TEntity) => ReactNode;
}

export interface DetailSectionConfig<TEntity> {
  id?: string;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  gridCols?: 1 | 2 | 3 | 4;
  fields?: DetailFieldConfig<TEntity>[];
  renderCustom?: (entity: TEntity) => ReactNode;
}

export interface DetailHeaderMetadataField<TEntity> {
  key?: keyof TEntity | string;
  label?: string;
  render?: (entity: TEntity) => ReactNode;
  format?: (value: unknown, entity: TEntity) => string;
  monospace?: boolean;
}

export interface DetailHeaderConfig<TEntity> {
  titleKey?: keyof TEntity | string;
  subtitleKey?: keyof TEntity | string;
  showStatusBadge?: boolean;
  statusKey?: keyof TEntity | string;
  getStatusTone?: (
    status: unknown,
    entity: TEntity
  ) => "success" | "secondary" | "destructive" | "warning";
  getStatusLabel?: (status: unknown, entity: TEntity) => string;
  metadataFields?: DetailHeaderMetadataField<TEntity>[];
}

export interface DetailConfig<TEntity> {
  mode?: DetailLayoutMode;
  defaultTab?: string;
  header?: DetailHeaderConfig<TEntity>;
  sections: DetailSectionConfig<TEntity>[];
  renderDetail?: (entity: TEntity) => ReactNode;
}

// ----------------------------------------------------------------------
// Filter Configuration
// ----------------------------------------------------------------------

export interface SearchFilterConfig {
  type: "search";
  name: string;
  label?: string;
  placeholder?: string;
}

export interface SelectFilterConfig {
  type: "select";
  name: string;
  label?: string;
  options: { value: string; translationKey: string }[];
}

export interface RelationFilterConfig {
  type: "relation";
  name: string;
  label?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  relation: RelationConfig<any>;
}

export interface CustomFilterConfig {
  type: "custom";
  name: string;
  render: (props: { value: unknown; onChange: (val: unknown) => void }) => ReactNode;
}

export type FilterConfig =
  SearchFilterConfig | SelectFilterConfig | RelationFilterConfig | CustomFilterConfig;

// ----------------------------------------------------------------------
// Actions Configuration
// ----------------------------------------------------------------------

export interface ConfirmConfig {
  translationKey: string;
  descriptionKey?: string;
}

export interface RenderDialogProps<TEntity> {
  entity: TEntity;
  isOpen: boolean;
  onClose: () => void;
  refreshTable: () => void;
}

export interface ActionHelpers {
  refreshTable: () => void;
  notifySuccess: (translationKey: string) => void;
  notifyError: (translationKey: string) => void;
}

export interface ModuleAction<TEntity> {
  id: string;
  type: "view" | "edit" | "delete" | "custom";
  permission?: Permission;
  icon?: LucideIcon;
  translationKey?: string;
  href?: (row: TEntity) => string;
  onClick?: (row: TEntity, helpers: ActionHelpers) => void | Promise<void>;
  variant?: "ghost" | "secondary" | "destructive" | "default" | "outline" | "success";
  confirm?: ConfirmConfig;
  renderDialog?: (props: RenderDialogProps<TEntity>) => ReactNode;
  isVisible?: (row: TEntity) => boolean;
}

// ----------------------------------------------------------------------
// Main CrudModuleConfig
// ----------------------------------------------------------------------

export interface CrudModuleConfig<
  TEntity extends BaseEntity,
  TDto,
  TFormValues,
  TQueryParams extends BaseQueryParams = BaseQueryParams,
  TColumnId extends string = string,
> {
  entity: string;
  basePath: string;
  translationNamespace: string;
  permissions: ModulePermissions;
  api: CrudApiConfig<TEntity, TDto, TFormValues, TQueryParams>;
  table: TableConfig<TEntity, TColumnId>;
  form?: FormConfig<TEntity, TFormValues>;
  detail?: DetailConfig<TEntity>;
  filters?: FilterConfig[];
  actions?: ModuleAction<TEntity>[];
}

// ----------------------------------------------------------------------
// Hooks Return Interface
// ----------------------------------------------------------------------

export interface CrudHooks<
  TEntity extends BaseEntity,
  TFormValues,
  TQueryParams extends BaseQueryParams = BaseQueryParams,
> {
  useList: (params: TQueryParams) => UseQueryResult<ListResponse<TEntity>, Error>;
  useDetail: (id: string) => UseQueryResult<TEntity, Error>;
  useCreate: () => UseMutationResult<TEntity, Error, TFormValues>;
  useUpdate: () => UseMutationResult<TEntity, Error, { id: string; data: Partial<TFormValues> }>;
  useDelete: () => UseMutationResult<void, Error, string>;
}
