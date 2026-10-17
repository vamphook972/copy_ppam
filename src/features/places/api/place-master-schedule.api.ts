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

export interface EffectiveMasterScheduleDto {
  hasCustomSchedule: boolean;
  zoneId: string;
  turns: MasterTurnDto[];
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

export const placeMasterScheduleApi = {
  async getEffective(placeId: string): Promise<EffectiveMasterScheduleDto> {
    const response = await axiosClient.get<{ data: EffectiveMasterScheduleDto }>(
      `/v1/places/${placeId}/master-schedule/effective`
    );
    return unwrap(response.data);
  },

  async customize(placeId: string): Promise<EffectiveMasterScheduleDto> {
    const response = await axiosClient.post<{ data: EffectiveMasterScheduleDto }>(
      `/v1/places/${placeId}/master-schedule/customize`
    );
    return unwrap(response.data);
  },

  async reset(placeId: string): Promise<void> {
    await axiosClient.post(`/v1/places/${placeId}/master-schedule/reset`);
  },

  async createTurn(placeId: string, payload: CreateMasterTurnPayload): Promise<MasterTurnDto> {
    const response = await axiosClient.post<{ data: MasterTurnDto }>(
      `/v1/places/${placeId}/master-schedule`,
      payload
    );
    return unwrap(response.data);
  },

  async updateTurn(
    placeId: string,
    turnId: string,
    payload: UpdateMasterTurnPayload
  ): Promise<void> {
    await axiosClient.put(`/v1/places/${placeId}/master-schedule/${turnId}`, payload);
  },

  async deactivateTurn(placeId: string, turnId: string): Promise<void> {
    await axiosClient.delete(`/v1/places/${placeId}/master-schedule/${turnId}`);
  },
};
