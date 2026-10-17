import { apiClient } from "@/lib/http";

import { TenantSettings, UpdateSettingsRequest } from "../types/settings";

interface ApiWrappedPayload<T> {
  data: T;
}

type ApiResult<T> = ApiWrappedPayload<T> | T;

function unwrapPayload<T>(payload: ApiResult<T>): T {
  if (typeof payload === "object" && payload !== null && "data" in payload) {
    return (payload as ApiWrappedPayload<T>).data;
  }
  return payload as T;
}

export const settingsApi = {
  async getSettings(tenantId?: string): Promise<TenantSettings> {
    const params = tenantId ? { tenantId } : undefined;
    const payload = await apiClient.get<ApiResult<TenantSettings>>("/v1/settings", {
      params,
    });
    return unwrapPayload(payload);
  },

  async updateSettings(data: UpdateSettingsRequest, tenantId?: string): Promise<TenantSettings> {
    const params = tenantId ? { tenantId } : undefined;
    const payload = await apiClient.put<ApiResult<TenantSettings>>("/v1/settings", data, {
      params,
    });
    return unwrapPayload(payload);
  },
};
