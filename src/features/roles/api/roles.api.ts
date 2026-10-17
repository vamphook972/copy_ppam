import { mapUserDtoToUser, type UserDto } from "@/features/users";
import { apiClient } from "@/lib/http";
import { isWrappedPayload, type ApiResult } from "@/lib/http/mappers";
import { extractPagination, type Pagination } from "@/shared/types/api";
import { transformQueryParams } from "@/shared/utils/query-transform";

import {
  ROLE_CATEGORIES,
  type Role,
  type RoleDto,
  type RoleUsersQueryParams,
  type RoleUsersResponse,
} from "../types/role";

export const rolesApi = {
  async listRoles(): Promise<Role[]> {
    const payload = await apiClient.get<ApiResult<RoleDto>>("/v1/roles");
    const rawData = isWrappedPayload(payload) ? payload.data : payload;
    const items = Array.isArray(rawData) ? rawData : rawData ? [rawData] : [];

    return items.map((dto) => ({
      id: dto.id,
      name: dto.name,
      isSystem: dto.isSystem,
      category: ROLE_CATEGORIES[dto.name] ?? "OPERATIONS",
    }));
  },

  async getUsersByRole(
    roleId: string,
    params: RoleUsersQueryParams = {}
  ): Promise<RoleUsersResponse> {
    const queryParams = transformQueryParams({
      page: 1,
      pageSize: 25,
      ...params,
    });

    const payload = await apiClient.get<ApiResult<UserDto>>(`/v1/roles/${roleId}/users`, {
      params: queryParams,
    });

    const rawData = isWrappedPayload(payload) ? payload.data : payload;
    const rawItems = Array.isArray(rawData) ? rawData : rawData ? [rawData] : [];
    const items = rawItems.map(mapUserDtoToUser);
    const pagination: Pagination = extractPagination(payload, queryParams, items.length);

    return {
      items,
      pagination,
    };
  },

  async createRole(data: { name: string }): Promise<Role> {
    const payload = await apiClient.post<ApiResult<RoleDto>>("/v1/roles", data);
    const rawData = isWrappedPayload(payload) ? payload.data : payload;
    const dto = Array.isArray(rawData) ? rawData[0] : (rawData as RoleDto);

    return {
      id: dto.id,
      name: dto.name,
      isSystem: dto.isSystem,
      category: ROLE_CATEGORIES[dto.name] ?? "OPERATIONS",
    };
  },

  async deleteRole(roleId: string): Promise<void> {
    await apiClient.delete(`/v1/roles/${roleId}`);
  },

  async listAllPermissions(): Promise<import("../types/role").SystemPermission[]> {
    const payload =
      await apiClient.get<ApiResult<import("../types/role").SystemPermission>>("/v1/permissions");
    const rawData = isWrappedPayload(payload) ? payload.data : payload;
    return Array.isArray(rawData) ? rawData : rawData ? [rawData] : [];
  },

  async getRolePermissions(roleId: string): Promise<import("../types/role").SystemPermission[]> {
    const payload = await apiClient.get<ApiResult<import("../types/role").SystemPermission>>(
      `/v1/roles/${roleId}/permissions`
    );
    const rawData = isWrappedPayload(payload) ? payload.data : payload;
    return Array.isArray(rawData) ? rawData : rawData ? [rawData] : [];
  },

  async updateRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    await apiClient.put(`/v1/roles/${roleId}/permissions`, {
      permissionIds,
    });
  },

  async restoreRolePermissions(roleId: string): Promise<void> {
    await apiClient.post(`/v1/roles/${roleId}/permissions/restore-defaults`, {});
  },
};
