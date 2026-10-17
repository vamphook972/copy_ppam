import { PaginatedResponse } from "@/types/api";

import { CoordinatorDto, Tenant, TenantDto } from "../types/tenant";

export function mapTenant(dto: TenantDto): Tenant {
  return {
    id: dto.id,
    name: dto.name,
    status: dto.status,
    config: dto.config,
    centerLat: dto.centerLat ?? null,
    centerLng: dto.centerLng ?? null,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function mapCoordinator(dto: CoordinatorDto) {
  return {
    id: dto.id,
    email: dto.email,
    role: dto.role,
    status: dto.status,
  };
}

export function mapPaginatedTenants(response: PaginatedResponse<TenantDto>) {
  return {
    data: response.data?.map(mapTenant) ?? [],
    meta: response.meta,
  };
}

export function mapPaginatedCoordinators(response: PaginatedResponse<CoordinatorDto>) {
  return {
    data: response.data?.map(mapCoordinator) ?? [],
    meta: response.meta,
  };
}
