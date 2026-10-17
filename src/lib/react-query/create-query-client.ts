import { QueryClient } from "@tanstack/react-query";

import { queryConfig } from "./config";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: queryConfig.staleTime,
        gcTime: queryConfig.gcTime,
        retry: queryConfig.retry,
        refetchOnWindowFocus: queryConfig.refetchOnWindowFocus,
      },
      mutations: {
        retry: queryConfig.retry,
      },
    },
  });
}
