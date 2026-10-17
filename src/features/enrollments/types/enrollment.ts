import { z } from "zod";

import type { BaseEntity, BaseQueryParams, ListResponse } from "@/shared/types/crud-module.types";

import { enrollmentFormSchema } from "../schemas/enrollment-form.schema";

export type ContactAttemptResult = "SUCCESS" | "FAILED" | "UNREACHABLE";

export interface ContactAttemptDto {
  id: string;
  method: string;
  notes?: string | null;
  result?: ContactAttemptResult | null;
  attemptedAt: string;
  nextAttemptAt?: string | null;
  contactedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactAttempt extends BaseEntity {
  id: string;
  method: string;
  notes?: string | null;
  result?: ContactAttemptResult | null;
  attemptedAt: string;
  nextAttemptAt?: string | null;
  contactedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type EnrollmentStatus =
  | "PENDING"
  | "INVITED"
  | "PENDING_CAPACITATION"
  | "IN_CAPACITATION"
  | "COMPLETED"
  | "REJECTED"
  | "UNREACHABLE"
  | "NO_SHOW"
  | "INVITATION_EXPIRED";

export interface EnrollmentDto {
  id: string;
  userId?: string | null;
  email: string;
  countryCode?: string;
  phoneNumber: string;
  status: EnrollmentStatus;
  fileUrl?: string | null;
  fileId?: string | null;
  verifiedBy?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  contactAttempts?: ContactAttemptDto[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Enrollment extends BaseEntity {
  id: string;
  userId?: string | null;
  email: string;
  countryCode?: string;
  phoneNumber: string;
  status: EnrollmentStatus;
  fileUrl?: string | null;
  fileId?: string | null;
  verifiedBy?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  contactAttempts: ContactAttempt[];
  createdAt?: string;
  updatedAt?: string;
}

export type EnrollmentFormValues = z.infer<typeof enrollmentFormSchema>;

export interface EnrollmentsQueryParams extends BaseQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}

export type EnrollmentsListResponse = ListResponse<Enrollment>;

export interface RecordContactAttemptPayload {
  method: string;
  notes?: string | null;
  result?: ContactAttemptResult;
  nextAttemptAt?: string | null;
}

export interface InvitationTokenValidationResponse {
  enrollmentId: string;
  tenantId: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
}
