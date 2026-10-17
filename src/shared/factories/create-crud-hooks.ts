import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  BaseEntity,
  BaseQueryParams,
  CrudApiMethods,
  CrudHooks,
  ListResponse,
} from "@/shared/types/crud-module.types";

export function createCrudHooks<
  TEntity extends BaseEntity,
  TFormValues,
  TQueryParams extends BaseQueryParams = BaseQueryParams,
>(config: {
  entity: string;
  api: CrudApiMethods<TEntity, TFormValues, TQueryParams>;
}): CrudHooks<TEntity, TFormValues, TQueryParams> {
  const { entity, api } = config;

  return {
    useList(params: TQueryParams) {
      return useQuery<ListResponse<TEntity>, Error>({
        queryKey: [entity, "list", params],
        queryFn: () => api.list(params),
        retry: 1,
      });
    },

    useDetail(id: string) {
      return useQuery<TEntity, Error>({
        queryKey: [entity, "detail", id],
        queryFn: () => api.getById(id),
        enabled: Boolean(id),
        retry: 1,
      });
    },

    useCreate() {
      const queryClient = useQueryClient();
      return useMutation<TEntity, Error, TFormValues>({
        mutationFn: (data: TFormValues) => api.create(data),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [entity, "list"] });
        },
      });
    },

    useUpdate() {
      const queryClient = useQueryClient();
      return useMutation<TEntity, Error, { id: string; data: Partial<TFormValues> }>({
        mutationFn: ({ id, data }) => api.update(id, data),
        onSuccess: (_, variables) => {
          queryClient.invalidateQueries({ queryKey: [entity, "list"] });
          queryClient.invalidateQueries({ queryKey: [entity, "detail", variables.id] });
        },
      });
    },

    useDelete() {
      const queryClient = useQueryClient();
      return useMutation<void, Error, string>({
        mutationFn: (id: string) => api.remove(id),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [entity, "list"] });
        },
      });
    },
  };
}
