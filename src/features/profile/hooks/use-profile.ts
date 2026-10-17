import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { profileApi } from "../api/profile.api";
import type { UpdateProfileMePayload } from "../types";

export const PROFILE_ME_QUERY_KEY = ["profile", "me"] as const;

export function useProfileMeQuery() {
  return useQuery({
    queryKey: PROFILE_ME_QUERY_KEY,
    queryFn: () => profileApi.getProfileMe(),
  });
}

export function useUpdateProfileMeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileMePayload) => profileApi.updateProfileMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_ME_QUERY_KEY });
    },
  });
}
