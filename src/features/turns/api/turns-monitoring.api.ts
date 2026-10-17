import { axiosClient } from "@/lib/http/axios-client";

import type { ParticipantTurnCounts, ScheduledTurnMonitoringDto } from "../types/turn";

function unwrap<T>(res: T | { data: T }): T {
  return typeof res === "object" && res !== null && "data" in res ? (res as { data: T }).data : res;
}

export const turnsMonitoringApi = {
  async getDailyGrid(params: {
    shiftDate: string;
    cityId?: string;
    zoneId?: string;
    placeId?: string;
  }): Promise<ScheduledTurnMonitoringDto[]> {
    const searchParams = new URLSearchParams();
    searchParams.set("shiftDate", params.shiftDate);
    if (params.cityId) searchParams.set("cityId", params.cityId);
    if (params.zoneId) searchParams.set("zoneId", params.zoneId);
    if (params.placeId) searchParams.set("placeId", params.placeId);

    const response = await axiosClient.get<{ data: ScheduledTurnMonitoringDto[] }>(
      `/v1/turns/monitoring/daily?${searchParams.toString()}`
    );
    return unwrap(response.data);
  },

  async getPlaceWeeklyGrid(params: {
    placeId: string;
    fromDate: string;
    toDate: string;
  }): Promise<ScheduledTurnMonitoringDto[]> {
    const searchParams = new URLSearchParams();
    searchParams.set("fromDate", params.fromDate);
    searchParams.set("toDate", params.toDate);

    const response = await axiosClient.get<{ data: ScheduledTurnMonitoringDto[] }>(
      `/v1/places/${params.placeId}/turns/monitoring/weekly?${searchParams.toString()}`
    );
    return unwrap(response.data);
  },

  async getParticipantTurnCounts(params: {
    participantId: string;
    date: string;
  }): Promise<ParticipantTurnCounts> {
    const response = await axiosClient.get<{ data: ParticipantTurnCounts }>(
      `/v1/scheduling/participants/${params.participantId}/turn-counts?date=${params.date}`
    );
    return unwrap(response.data);
  },

  async assignParticipant(params: {
    shiftId: string;
    participantId: string;
    isRecurring?: boolean;
    endDate?: string | null;
  }): Promise<{
    assignmentId: string;
    recurringAssignmentId?: string;
    assignedTurnsCount?: number;
    skippedDates?: string[];
  }> {
    const response = await axiosClient.post<{
      data: {
        assignmentId: string;
        recurringAssignmentId?: string;
        assignedTurnsCount?: number;
        skippedDates?: string[];
      };
    }>(`/v1/shifts/${params.shiftId}/assignments`, {
      participantId: params.participantId,
      isRecurring: params.isRecurring ?? false,
      endDate: params.endDate ?? null,
    });
    return unwrap(response.data);
  },
};
