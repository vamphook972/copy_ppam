import { z } from "zod";

import type { BaseEntity, BaseQueryParams, ListResponse } from "@/shared/types/crud-module.types";

import { turnFormSchema } from "../schemas/turn-form.schema";

export type TurnTrafficLightColor = "RED" | "YELLOW" | "GREEN" | "GRAY";

export type TurnStatus =
  "SCHEDULED" | "PARTIALLY_COVERED" | "FULLY_COVERED" | "COMPLETED" | "CANCELED" | "UNATTENDED";

export type TurnFormValues = z.infer<typeof turnFormSchema>;

export interface AssignedParticipantSummaryDto {
  assignmentId: string;
  participantId: string;
  firstName: string;
  lastName: string;
  isRecurring: boolean;
  assignmentType: "MANUAL" | "REPLACEMENT" | "AUTO_ASSIGNMENT";
  status: "ASSIGNED" | "CONFIRMED" | "DECLINED" | "CANCELED";
}

export interface ScheduledTurnMonitoringDto {
  shiftId: string;
  masterTurnId: string;
  placeId: string;
  placeName?: string;
  zoneId?: string;
  zoneName?: string;
  cityId?: string;
  cityName?: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  minParticipants: number;
  maxParticipants: number;
  assignedCount: number;
  assignedParticipants?: AssignedParticipantSummaryDto[];
  trafficLight: TurnTrafficLightColor;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActiveAssignmentSummary {
  scheduledTurnId: string;
  placeId: string;
  placeName: string;
  startTime: string;
  endTime: string;
  startsAt: string;
  endsAt: string;
}

export interface ParticipantTurnCounts {
  participantId: string;
  privilege: string;
  daily: {
    current: number;
    max: number;
  };
  weekly: {
    current: number;
    max: number;
    isExceeded: boolean;
  };
  monthly: {
    current: number;
    max: number;
  };
  activeAssignments?: ActiveAssignmentSummary[];
}

export interface TurnDto {
  id: string;
  name: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Turn extends BaseEntity {
  id: string;
  name: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TurnsQueryParams extends BaseQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  cityId?: string;
  zoneId?: string;
  placeId?: string;
  shiftDate?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
}

export type TurnsListResponse = ListResponse<Turn>;
