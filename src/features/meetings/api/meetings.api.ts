import { axiosClient } from "@/lib/http/axios-client";
import { Pagination } from "@/shared/types/api";

import { mapAttendanceDtoToAttendance, mapMeetingDtoToMeeting } from "../mappers/meeting.mapper";
import type {
  Attendance,
  AttendanceDto,
  AttendancesQueryParams,
  CancelMeetingPayload,
  CompleteMeetingPayload,
  MarkAttendancePayload,
  Meeting,
  MeetingDto,
  StartMeetingPayload,
} from "../types/meeting";

interface ApiWrappedPayload<T> {
  data: T[] | T;
  pagination?: Pagination;
}

type ApiResult<T> = ApiWrappedPayload<T> | T[] | T;

function isWrappedPayload<T>(payload: ApiResult<T>): payload is ApiWrappedPayload<T> {
  return typeof payload === "object" && payload !== null && "data" in payload;
}

function unwrap<T>(res: T | { data: T }): T {
  return typeof res === "object" && res !== null && "data" in res ? (res as { data: T }).data : res;
}

export const meetingsApi = {
  getById: async (id: string): Promise<Meeting> => {
    const res = await axiosClient.get<MeetingDto | { data: MeetingDto }>(`/v1/meetings/${id}`);
    return mapMeetingDtoToMeeting(unwrap(res));
  },

  start: async (id: string, payload: StartMeetingPayload = {}): Promise<Meeting> => {
    const res = await axiosClient.post<MeetingDto | { data: MeetingDto }>(
      `/v1/meetings/${id}/start`,
      payload
    );
    return mapMeetingDtoToMeeting(unwrap(res));
  },

  complete: async (id: string, payload: CompleteMeetingPayload = {}): Promise<Meeting> => {
    const res = await axiosClient.post<MeetingDto | { data: MeetingDto }>(
      `/v1/meetings/${id}/complete`,
      payload
    );
    return mapMeetingDtoToMeeting(unwrap(res));
  },

  cancel: async (id: string, payload: CancelMeetingPayload): Promise<Meeting> => {
    const res = await axiosClient.delete<MeetingDto | { data: MeetingDto }>(`/v1/meetings/${id}`, {
      data: payload,
    });
    return mapMeetingDtoToMeeting(unwrap(res));
  },

  getAttendances: async (
    meetingId: string,
    params?: AttendancesQueryParams
  ): Promise<{ data: Attendance[]; total: number }> => {
    const res = await axiosClient.get<ApiResult<AttendanceDto>>(
      `/v1/meetings/${meetingId}/attendances`,
      { params }
    );

    const rawData = isWrappedPayload(res) ? res.data : res;
    const rawItems = Array.isArray(rawData) ? rawData : rawData ? [rawData] : [];
    const items = rawItems.map(mapAttendanceDtoToAttendance);

    return { data: items, total: items.length };
  },

  markAttendance: async (
    meetingId: string,
    payload: MarkAttendancePayload
  ): Promise<Attendance> => {
    const res = await axiosClient.patch<AttendanceDto | { data: AttendanceDto }>(
      `/v1/meetings/${meetingId}/attendance`,
      payload
    );
    return mapAttendanceDtoToAttendance(unwrap(res));
  },
};
