import { z } from "zod";

import type { Pagination } from "@/shared/types/api";

import { notificationTemplateSchema } from "../schemas/notification.schema";

export type NotificationTemplate = z.infer<typeof notificationTemplateSchema>;

export interface NotificationTemplateDto {
  templateId: string;
  language: string;
  subject: string;
  body: string;
  description?: string;
  variables?: string[];
}

export interface NotificationTemplatesQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  language?: string;
}

export interface NotificationTemplatesListResponse {
  items: NotificationTemplate[];
  pagination: Pagination;
}

export interface NotificationLogsListResponse {
  items: NotificationLog[];
  pagination: Pagination;
}

export interface PreviewTemplateRequest {
  variables: Record<string, string>;
}

export interface PreviewTemplateResponse {
  subject: string;
  body: string;
}

export interface NotificationLogDto {
  id: string;
  type: string;
  subject: string;
  body?: string;
  language?: string;
  status: "SENT" | "FAILED" | "PENDING";
  recipients: string[];
  recipientType?: string;
  deliveredAt?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt?: string;
  isRead?: boolean;
  payload?: Record<string, unknown>;
}

export interface NotificationLog {
  id: string;
  type: string;
  subject: string;
  body?: string;
  language?: string;
  status: "SENT" | "FAILED" | "PENDING";
  recipients: string[];
  recipientType?: string;
  deliveredAt?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt?: string;
  isRead?: boolean;
  payload?: Record<string, unknown>;
}

export interface SseNotificationEvent {
  id: string;
  tenantId: string;
  eventType: string;
  module: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface UiNotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: "info" | "alert" | "user";
  createdAt: string;
}
