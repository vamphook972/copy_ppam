export const queryConfig = {
  staleTime: 1000 * 60 * 5, // 5 minutos
  gcTime: 1000 * 60 * 10, // 10 minutos
  retry: 1,
  refetchOnWindowFocus: false,
} as const;
