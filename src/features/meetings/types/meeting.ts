import { z } from "zod";

import type { BaseEntity, BaseQueryParams, ListResponse } from "@/shared/types/crud-module.types";

import { meetingFormSchema } from "../schemas/meeting-form.schema";

export type MeetingType =
  "INITIAL_ORIENTATION" | "ANNUAL_MEETING" | "MONTHLY_MEETING" | "EXTRAORDINARY_MEETING" | "OTHER";

export type MeetingStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELED";

export type AttendanceStatus = "PENDING" | "ATTENDED" | "NO_SHOW";

export type MeetingFormValues = z.infer<typeof meetingFormSchema>;

export interface AttendanceDto {
  id: string;
  meetingId: string;
  enrollmentId?: string;
  participantId?: string;
  status: AttendanceStatus;
  recordedBy?: string;
  recordedAt?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Attendance extends BaseEntity {
  id: string;
  meetingId: string;
  enrollmentId?: string;
  participantId?: string;
  status: AttendanceStatus;
  recordedBy?: string;
  recordedAt?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MeetingDto {
  id: string;
  type: MeetingType;
  title: string;
  description?: string;
  location: string;
  scheduledAt: string;
  maxParticipants: number;
  zoneId?: string;
  status: MeetingStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Meeting extends BaseEntity {
  id: string;
  type: MeetingType;
  title: string;
  description?: string;
  location: string;
  scheduledAt: string;
  maxParticipants: number;
  zoneId?: string;
  status: MeetingStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface MeetingsQueryParams extends BaseQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: MeetingStatus;
}

export interface AttendancesQueryParams extends BaseQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: AttendanceStatus;
}

export type MeetingsListResponse = ListResponse<Meeting>;
export type AttendancesListResponse = ListResponse<Attendance>;

export interface StartMeetingPayload {
  startedAt?: string;
  comments?: string;
}

export interface CompleteMeetingPayload {
  completedAt?: string;
  comments?: string;
}

export interface CancelMeetingPayload {
  comments: string;
}

export interface MarkAttendancePayload {
  qrCode: string;
  notes?: string;
}
