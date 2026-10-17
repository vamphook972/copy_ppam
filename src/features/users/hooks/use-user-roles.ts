import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { userRolesApi } from "../api/user-roles.api";

export function useUserRoles(userId: string) {
  return useQuery({
    queryKey: ["users", userId, "roles"],
    queryFn: () => userRolesApi.getUserRoles(userId),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdateUserRoles(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roles: string[]) => userRolesApi.updateUserRoles(userId, { roles }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users", userId, "roles"] });
      void queryClient.invalidateQueries({ queryKey: ["users", userId] });
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
