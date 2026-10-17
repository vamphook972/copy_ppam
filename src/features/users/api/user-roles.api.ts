import { apiClient } from "@/lib/http";

import type {
  UpdateUserRolesPayload,
  UpdateUserRolesResponseDto,
  UserRolesResponseDto,
} from "../types/user-roles";

export const userRolesApi = {
  async getUserRoles(userId: string): Promise<UserRolesResponseDto> {
    return apiClient.get<UserRolesResponseDto>(`/v1/users/${userId}/roles`);
  },

  async updateUserRoles(
    userId: string,
    payload: UpdateUserRolesPayload
  ): Promise<UpdateUserRolesResponseDto> {
    return apiClient.put<UpdateUserRolesResponseDto, UpdateUserRolesPayload>(
      `/v1/users/${userId}/roles`,
      payload
    );
  },
};
