import { axiosClient } from "@/lib/http/axios-client";

export interface MasterTurnDto {
  id: string;
  zoneId?: string;
  placeId?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  minParticipants: number;
  maxParticipants: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMasterTurnPayload {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  minParticipants: number;
  maxParticipants: number;
}

export interface UpdateMasterTurnPayload {
  startTime: string;
  endTime: string;
  minParticipants: number;
  maxParticipants: number;
}

function unwrap<T>(res: T | { data: T }): T {
  return typeof res === "object" && res !== null && "data" in res ? (res as { data: T }).data : res;
}

export const zoneMasterScheduleApi = {
  async getByZone(zoneId: string): Promise<MasterTurnDto[]> {
    const response = await axiosClient.get<{ data: MasterTurnDto[] }>(
      `/v1/zones/${zoneId}/master-schedule`
    );
    return unwrap(response.data);
  },

  async create(zoneId: string, payload: CreateMasterTurnPayload): Promise<MasterTurnDto> {
    const response = await axiosClient.post<{ data: MasterTurnDto }>(
      `/v1/zones/${zoneId}/master-schedule`,
      payload
    );
    return unwrap(response.data);
  },

  async update(zoneId: string, turnId: string, payload: UpdateMasterTurnPayload): Promise<void> {
    await axiosClient.put(`/v1/zones/${zoneId}/master-schedule/${turnId}`, payload);
  },

  async deactivate(zoneId: string, turnId: string): Promise<void> {
    await axiosClient.delete(`/v1/zones/${zoneId}/master-schedule/${turnId}`);
  },
};
