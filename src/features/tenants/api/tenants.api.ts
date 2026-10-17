import { apiClient } from "@/lib/http";
import { extractPagination, type Pagination } from "@/shared/types/api";

import { mapCoordinator, mapTenant } from "../mappers/tenant.mapper";
import {
  AddCoordinatorRequest,
  Coordinator,
  CoordinatorDto,
  CoordinatorsListResponse,
  CreateTenantRequest,
  Tenant,
  TenantDto,
  TenantsListResponse,
  TenantsQueryParams,
} from "../types/tenant";

interface ApiWrappedPayload<T> {
  data: T[] | T;
  pagination?: Pagination;
}

type ApiResult<T> = ApiWrappedPayload<T> | T[] | T;

function isWrappedPayload<T>(payload: ApiResult<T>): payload is ApiWrappedPayload<T> {
  return typeof payload === "object" && payload !== null && "data" in payload;
}

export const tenantsApi = {
  async getTenants(params?: TenantsQueryParams): Promise<TenantsListResponse> {
    const payload = await apiClient.get<ApiResult<TenantDto>>("/v1/tenants", {
      params: params as Record<string, unknown>,
    });

    const rawData = isWrappedPayload(payload) ? payload.data : payload;
    const rawItems = Array.isArray(rawData) ? rawData : rawData ? [rawData] : [];
    const items = rawItems.map(mapTenant);
    const pagination = extractPagination(payload, params, items.length);

    return {
      items,
      pagination,
    };
  },

  async getTenant(id: string): Promise<Tenant> {
    const payload = await apiClient.get<ApiResult<TenantDto>>(`/v1/tenants/${id}`);
    const rawData = isWrappedPayload(payload) ? payload.data : payload;
    const dto = Array.isArray(rawData) ? rawData[0] : (rawData as TenantDto);
    return mapTenant(dto);
  },

  async createTenant(data: CreateTenantRequest): Promise<Tenant> {
    const payload = await apiClient.post<ApiResult<TenantDto>>("/v1/tenants", data);
    const rawData = isWrappedPayload(payload) ? payload.data : payload;
    const dto = Array.isArray(rawData) ? rawData[0] : (rawData as TenantDto);
    return mapTenant(dto);
  },

  async updateTenant(id: string, data: Partial<CreateTenantRequest>): Promise<Tenant> {
    const payload = await apiClient.patch<ApiResult<TenantDto>>(`/v1/tenants/${id}`, data);
    const rawData = isWrappedPayload(payload) ? payload.data : payload;
    const dto = Array.isArray(rawData) ? rawData[0] : (rawData as TenantDto);
    return mapTenant(dto);
  },

  async updateStatus(id: string, status: "ACTIVE" | "SUSPENDED"): Promise<Tenant> {
    const payload = await apiClient.patch<ApiResult<TenantDto>>(`/v1/tenants/${id}/status`, {
      status,
    });
    const rawData = isWrappedPayload(payload) ? payload.data : payload;
    const dto = Array.isArray(rawData) ? rawData[0] : (rawData as TenantDto);
    return mapTenant(dto);
  },

  async getCoordinators(
    tenantId: string,
    params?: Record<string, unknown>
  ): Promise<CoordinatorsListResponse> {
    const payload = await apiClient.get<ApiResult<CoordinatorDto>>(
      `/v1/tenants/${tenantId}/coordinators`,
      { params }
    );

    const rawData = isWrappedPayload(payload) ? payload.data : payload;
    const rawItems = Array.isArray(rawData) ? rawData : rawData ? [rawData] : [];
    const items = rawItems.map(mapCoordinator);

    const pagination = (isWrappedPayload(payload) ? payload.pagination : undefined) ?? {
      page: (params?.page as number) ?? 1,
      pageSize: (params?.pageSize as number) ?? (items.length || 25),
      total: items.length,
    };

    return {
      items,
      pagination,
    };
  },

  async addCoordinator(tenantId: string, data: AddCoordinatorRequest): Promise<Coordinator> {
    const payload = await apiClient.post<ApiResult<CoordinatorDto>>(
      `/v1/tenants/${tenantId}/coordinators`,
      data
    );
    const rawData = isWrappedPayload(payload) ? payload.data : payload;
    const dto = Array.isArray(rawData) ? rawData[0] : (rawData as CoordinatorDto);
    return mapCoordinator(dto);
  },

  async updatePrivilegeLimits(
    privilegeLimits: Record<string, unknown>,
    tenantId?: string
  ): Promise<Tenant> {
    const endpoint =
      tenantId && tenantId !== "current"
        ? `/v1/tenants/${tenantId}/privilege-limits`
        : "/v1/tenants/current/privilege-limits";

    const payload = await apiClient.put<ApiResult<TenantDto>>(endpoint, { privilegeLimits });
    const rawData = isWrappedPayload(payload) ? payload.data : payload;
    const dto = Array.isArray(rawData) ? rawData[0] : (rawData as TenantDto);
    return mapTenant(dto);
  },
};
