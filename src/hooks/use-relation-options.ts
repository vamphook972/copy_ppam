"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import type { ComboboxOption } from "@/components/ui/combobox";
import { apiClient } from "@/lib/http";
import type { Pagination } from "@/shared/types/api";
import type { RelationConfig } from "@/shared/types/crud-module.types";
import { transformQueryParams } from "@/shared/utils/query-transform";

interface ApiWrappedPayload<T> {
  data: T[] | T;
  pagination?: Pagination;
}

type ApiResult<T> = ApiWrappedPayload<T> | T[] | T;

function isWrappedPayload<T>(payload: ApiResult<T>): payload is ApiWrappedPayload<T> {
  return typeof payload === "object" && payload !== null && "data" in payload;
}

export function useRelationOptions(
  config: RelationConfig,
  watchedValue?: string
): {
  options: ComboboxOption[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
} {
  const { endpoint, queryParams = {}, mapToOption, dependsOn } = config;

  const isEnabled = dependsOn ? Boolean(watchedValue) : true;

  const activeParams = useMemo(() => {
    const params: Record<string, unknown> = { ...queryParams };
    if (dependsOn && watchedValue) {
      params[dependsOn.paramName] = watchedValue;
    }
    return transformQueryParams(params);
  }, [queryParams, dependsOn, watchedValue]);

  const queryKey = useMemo(
    () => ["relation-options", endpoint, activeParams],
    [endpoint, activeParams]
  );

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const payload = await apiClient.get<ApiResult<unknown>>(endpoint, {
        params: activeParams,
      });

      return isWrappedPayload(payload) ? payload.data : payload;
    },
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const options = useMemo(() => {
    const rawData = query.data;
    const items = Array.isArray(rawData) ? rawData : rawData ? [rawData] : [];
    return items.map(mapToOption);
  }, [query.data, mapToOption]);

  return {
    options,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error as Error | null,
  };
}
