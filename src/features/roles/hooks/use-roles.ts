import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { rolesApi } from "../api/roles.api";
import type { RoleUsersQueryParams } from "../types/role";

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: () => rolesApi.listRoles(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useRoleUsers(roleId: string, params: RoleUsersQueryParams = {}) {
  return useQuery({
    queryKey: ["roles", roleId, "users", params],
    queryFn: () => rolesApi.getUsersByRole(roleId, params),
    enabled: Boolean(roleId),
    staleTime: 1000 * 60 * 2,
  });
}

export function useAllPermissions() {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: () => rolesApi.listAllPermissions(),
    staleTime: 1000 * 60 * 30, // permissions rarely change
  });
}

export function useRolePermissions(roleId: string) {
  return useQuery({
    queryKey: ["roles", roleId, "permissions"],
    queryFn: () => rolesApi.getRolePermissions(roleId),
    enabled: Boolean(roleId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) =>
      rolesApi.updateRolePermissions(roleId, permissionIds),
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: ["roles", roleId, "permissions"] });
    },
  });
}

export function useRestoreRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleId: string) => rolesApi.restoreRolePermissions(roleId),
    onSuccess: (_, roleId) => {
      queryClient.invalidateQueries({ queryKey: ["roles", roleId, "permissions"] });
    },
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string }) => rolesApi.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleId: string) => rolesApi.deleteRole(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}
