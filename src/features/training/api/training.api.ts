import { axiosClient } from "@/lib/http/axios-client";

import type { ScheduleTrainingFormValues, TrainingDto } from "../types/training";

export interface SelectOptionItem {
  value: string;
  label: string;
}

function unwrap<T>(res: T | { data: T }): T {
  return typeof res === "object" && res !== null && "data" in res ? (res as { data: T }).data : res;
}

export const trainingApi = {
  schedule: async (
    trainingId: string,
    values: ScheduleTrainingFormValues
  ): Promise<TrainingDto> => {
    const response = await axiosClient.put<TrainingDto>(`/v1/trainings/${trainingId}/schedule`, {
      userId: values.userId,
      enrollmentId: values.enrollmentId,
      capacitatorId: values.capacitatorId,
      placeId: values.placeId,
      scheduledAt: new Date(values.scheduledAt).toISOString(),
    });
    return unwrap(response);
  },

  getCities: async (): Promise<SelectOptionItem[]> => {
    const response = await axiosClient.get<{ data: Array<{ id: string; name: string }> }>(
      "/v1/cities",
      {
        params: { status: "ACTIVE", pageSize: 200 },
      }
    );
    const data = unwrap(response.data);
    const list = Array.isArray(data) ? data : [];
    return list.map((item) => ({
      value: String(item.id),
      label: String(item.name),
    }));
  },

  getZonesByCity: async (cityId: string): Promise<SelectOptionItem[]> => {
    if (!cityId) return [];
    const response = await axiosClient.get<{ data: Array<{ id: string; name: string }> }>(
      "/v1/zones",
      {
        params: { cityId, status: "ACTIVE", pageSize: 200 },
      }
    );
    const data = unwrap(response.data);
    const list = Array.isArray(data) ? data : [];
    return list.map((item) => ({
      value: String(item.id),
      label: String(item.name),
    }));
  },

  getPlacesByZoneAndCity: async (cityId?: string, zoneId?: string): Promise<SelectOptionItem[]> => {
    const params: Record<string, string> = { pageSize: "200" };
    if (cityId) params.cityId = cityId;
    if (zoneId) params.zoneId = zoneId;

    const response = await axiosClient.get<{ data: Array<{ id: string; name: string }> }>(
      "/v1/places",
      {
        params,
      }
    );
    const data = unwrap(response.data);
    const list = Array.isArray(data) ? data : [];
    return list.map((item) => ({
      value: String(item.id),
      label: String(item.name),
    }));
  },

  getCapacitators: async (): Promise<SelectOptionItem[]> => {
    const response = await axiosClient.get<{
      data: Array<{
        id: string;
        name?: string;
        firstName?: string;
        lastName?: string;
        email: string;
      }>;
    }>("/v1/users", {
      params: { pageSize: 200 },
    });
    const data = unwrap(response.data);
    const list = Array.isArray(data) ? data : [];
    return list.map((u) => ({
      value: String(u.id),
      label: u.name || `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email,
    }));
  },

  getEnrollmentCityId: async (enrollmentId: string): Promise<string | undefined> => {
    if (!enrollmentId) return undefined;
    try {
      const response = await axiosClient.get<{ data: { cityId?: string } }>(
        `/v1/enrollments/${enrollmentId}`
      );
      const data = unwrap(response.data);
      return data?.cityId;
    } catch {
      return undefined;
    }
  },

  evaluate: async (
    trainingId: string,
    checklist: {
      items: Array<{ id: string; label: string; isRequired: boolean; passed: boolean }>;
    },
    notes?: string
  ): Promise<TrainingDto> => {
    const response = await axiosClient.put<TrainingDto>(`/v1/trainings/${trainingId}/evaluation`, {
      checklist,
      notes,
    });
    return unwrap(response);
  },

  approve: async (trainingId: string): Promise<TrainingDto> => {
    const response = await axiosClient.post<TrainingDto>(`/v1/trainings/${trainingId}/approve`, {});
    return unwrap(response);
  },

  reject: async (
    trainingId: string,
    retry: boolean,
    scheduledAt?: string
  ): Promise<TrainingDto> => {
    const response = await axiosClient.post<TrainingDto>(`/v1/trainings/${trainingId}/reject`, {
      retry,
      scheduledAt,
    });
    return unwrap(response);
  },
};
