import { z } from "zod";

import type { BaseEntity, BaseQueryParams, ListResponse } from "@/shared/types/crud-module.types";

import { scheduleTrainingFormSchema, trainingFormSchema } from "../schemas/training-form.schema";

export type TrainingStatus =
  "CREATED" | "SCHEDULED" | "IN_PROGRESS" | "REPROGRAMMED" | "COMPLETED" | "FAILED";

export type TrainingFormValues = z.infer<typeof trainingFormSchema>;
export type ScheduleTrainingFormValues = z.infer<typeof scheduleTrainingFormSchema>;

export interface TrainingEvaluationChecklist {
  items: Array<{
    id: string;
    label: string;
    passed: boolean;
  }>;
}

export interface TrainingDto {
  id: string;
  userId: string;
  enrollmentId?: string | null;
  capacitatorId?: string | null;
  placeId?: string | null;
  scheduledAt?: string | null;
  attemptNumber: number;
  status: TrainingStatus;
  evaluationChecklist?: TrainingEvaluationChecklist | Record<string, unknown> | null;
  notes?: string | null;
  evaluatedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  // Joined or enriched labels from API if available
  userName?: string;
  userPhone?: string;
  userEmail?: string;
  capacitatorName?: string;
  placeName?: string;
}

export interface Training extends BaseEntity {
  id: string;
  userId: string;
  enrollmentId: string;
  capacitatorId?: string | null;
  placeId?: string | null;
  scheduledAt?: string | null;
  attemptNumber: number;
  status: TrainingStatus;
  evaluationChecklist?: TrainingEvaluationChecklist | Record<string, unknown> | null;
  notes?: string | null;
  evaluatedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  userName?: string;
  userPhone?: string;
  userEmail?: string;
  capacitatorName?: string;
  placeName?: string;
}

export interface TrainingQueryParams extends BaseQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  filterStatus?: TrainingStatus;
  filterUserId?: string;
  filterCapacitatorId?: string;
  filterPlaceId?: string;
}

export type TrainingListResponse = ListResponse<Training>;
