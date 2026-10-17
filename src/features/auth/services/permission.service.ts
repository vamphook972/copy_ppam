import { permissionsApi } from "@/features/auth/api/permissions.api";
import { mapPermissions } from "@/features/auth/mappers/permission.mapper";
import { PermissionState } from "@/features/auth/types/permission";

export const permissionService = {
  async getMyPermissions(): Promise<PermissionState> {
    const dto = await permissionsApi.getMyPermissions();

    return mapPermissions(dto);
  },
};
