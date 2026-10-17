import { apiClient } from "@/lib/http";
import { extractPagination, type Pagination } from "@/shared/types/api";
import type {
  BaseEntity,
  BaseQueryParams,
  CrudApiConfig,
  CrudApiMethods,
  ListResponse,
} from "@/shared/types/crud-module.types";
import { transformQueryParams } from "@/shared/utils/query-transform";

interface ApiWrappedPayload<T> {
  data: T[] | T;
  pagination?: Pagination;
}

type ApiResult<T> = ApiWrappedPayload<T> | T[] | T;

function isWrappedPayload<T>(payload: ApiResult<T>): payload is ApiWrappedPayload<T> {
  return typeof payload === "object" && payload !== null && "data" in payload;
}

export function createCrudApi<
  TEntity extends BaseEntity,
  TDto,
  TFormValues,
  TQueryParams extends BaseQueryParams = BaseQueryParams,
>(
  config: CrudApiConfig<TEntity, TDto, TFormValues, TQueryParams>
): CrudApiMethods<TEntity, TFormValues, TQueryParams> {
  const { endpoint, mapDtoToEntity } = config;

  return {
    async list(params: TQueryParams): Promise<ListResponse<TEntity>> {
      if (config.list) {
        return config.list(params);
      }

      const queryParams = transformQueryParams({
        ...config.defaultParams,
        ...params,
      });

      const payload = await apiClient.get<ApiResult<TDto>>(endpoint, {
        params: queryParams,
      });

      const rawData = isWrappedPayload(payload) ? payload.data : payload;
      const rawItems = Array.isArray(rawData) ? rawData : rawData ? [rawData] : [];
      const items = rawItems.map(mapDtoToEntity);
      const pagination = extractPagination(payload, queryParams, items.length);

      return {
        items,
        pagination,
      };
    },

    async getById(id: string): Promise<TEntity> {
      if (config.getById) {
        return config.getById(id);
      }

      const payload = await apiClient.get<ApiResult<TDto>>(`${endpoint}/${id}`, {
        params: config.defaultParams as Record<string, unknown>,
      });
      const rawData = isWrappedPayload(payload) ? payload.data : payload;
      const dto = Array.isArray(rawData) ? rawData[0] : (rawData as TDto);

      return mapDtoToEntity(dto);
    },

    async create(input: TFormValues): Promise<TEntity> {
      if (config.create) {
        return config.create(input);
      }

      const payload = await apiClient.post<ApiResult<TDto>>(endpoint, input);
      const rawData = isWrappedPayload(payload) ? payload.data : payload;
      const dto = Array.isArray(rawData) ? rawData[0] : (rawData as TDto);

      return mapDtoToEntity(dto);
    },

    async update(id: string, input: Partial<TFormValues>): Promise<TEntity> {
      if (config.update) {
        return config.update(id, input);
      }

      const payload = await apiClient.put<ApiResult<TDto>>(`${endpoint}/${id}`, input);
      const rawData = isWrappedPayload(payload) ? payload.data : payload;
      const dto = Array.isArray(rawData) ? rawData[0] : (rawData as TDto);

      return mapDtoToEntity(dto);
    },

    async remove(id: string): Promise<void> {
      if (config.remove) {
        return config.remove(id);
      }

      await apiClient.delete(`${endpoint}/${id}`);
    },
  };
}
