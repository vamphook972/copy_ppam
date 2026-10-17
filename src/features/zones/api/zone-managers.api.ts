import type { User } from "@/features/users";
import { ApiResult } from "@/lib/http";
import { axiosClient } from "@/lib/http/axios-client";

import type { ZoneManagerDto } from "../types/zone";

function unwrap<T>(res: T | { data: T }): T {
  return typeof res === "object" && res !== null && "data" in res ? (res as { data: T }).data : res;
}

export const zoneManagersApi = {
  async getManagers(zoneId: string): Promise<ZoneManagerDto[]> {
    const response = await axiosClient.get<{ data: ZoneManagerDto[] }>(
      `/v1/zones/${zoneId}/managers`
    );
    return unwrap(response.data);
  },

  async assignManager(zoneId: string, userId: string): Promise<ZoneManagerDto> {
    const response = await axiosClient.post<{ data: ZoneManagerDto }>(
      `/v1/zones/${zoneId}/managers`,
      { userId }
    );
    return unwrap(response.data);
  },

  async getCandidates(search?: string): Promise<User[]> {
    const response = await axiosClient.get<ApiResult<User>>("/v1/users", {
      params: {
        roles: "ZONE-SUPERINTENDENT",
        status: "ACTIVE",
        pageSize: 100,
        search: search || undefined,
      },
    });
    const resData = unwrap(response);
    const rawItems = Array.isArray(resData) ? resData : resData ? [resData] : [];
    return rawItems;
  },
};
