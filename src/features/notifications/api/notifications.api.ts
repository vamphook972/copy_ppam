import { apiClient } from "@/lib/http";
import { extractPagination, type Pagination } from "@/shared/types/api";

import { mapNotificationLog, mapNotificationTemplate } from "../mappers/notification.mapper";
import {
  NotificationLogDto,
  NotificationLogsListResponse,
  NotificationTemplate,
  NotificationTemplateDto,
  NotificationTemplatesListResponse,
  NotificationTemplatesQueryParams,
  PreviewTemplateRequest,
  PreviewTemplateResponse,
  SseNotificationEvent,
} from "../types/notification";

interface ApiWrappedPayload<T> {
  data: T[] | T;
  pagination?: Pagination;
}

type ApiResult<T> = ApiWrappedPayload<T> | T[] | T;

function isWrappedPayload<T>(payload: ApiResult<T>): payload is ApiWrappedPayload<T> {
  return typeof payload === "object" && payload !== null && "data" in payload;
}

export const notificationsApi = {
  async getTemplates(
    params?: NotificationTemplatesQueryParams
  ): Promise<NotificationTemplatesListResponse> {
    const payload = await apiClient.get<ApiResult<NotificationTemplateDto>>(
      "/v1/notifications/templates",
      { params: params as Record<string, unknown> }
    );

    const rawData = isWrappedPayload(payload) ? payload.data : payload;
    const rawItems = Array.isArray(rawData) ? rawData : rawData ? [rawData] : [];
    const items = rawItems.map(mapNotificationTemplate);
    const pagination = extractPagination(payload, params, items.length);

    return {
      items,
      pagination,
    };
  },

  async createTemplate(data: NotificationTemplate): Promise<NotificationTemplate> {
    const payload = await apiClient.post<ApiResult<NotificationTemplateDto>>(
      "/v1/notifications/templates",
      data
    );
    const rawData = isWrappedPayload(payload) ? payload.data : payload;
    const dto = Array.isArray(rawData) ? rawData[0] : (rawData as NotificationTemplateDto);
    return mapNotificationTemplate(dto);
  },

  async previewTemplate(
    templateId: string,
    data: PreviewTemplateRequest
  ): Promise<PreviewTemplateResponse> {
    const payload = await apiClient.post<ApiResult<PreviewTemplateResponse>>(
      `/v1/notifications/templates/${templateId}/preview`,
      data
    );
    const rawData = isWrappedPayload(payload) ? payload.data : payload;
    return Array.isArray(rawData) ? rawData[0] : (rawData as PreviewTemplateResponse);
  },

  async getLogs(
    tenantId: string,
    params?: Record<string, unknown>
  ): Promise<NotificationLogsListResponse> {
    const payload = await apiClient.get<ApiResult<NotificationLogDto>>(
      `/v1/notifications/logs/${tenantId}`,
      { params }
    );

    const rawData = isWrappedPayload(payload) ? payload.data : payload;
    const rawItems = Array.isArray(rawData) ? rawData : rawData ? [rawData] : [];
    const items = rawItems.map(mapNotificationLog);

    const pagination = extractPagination(payload, params, items.length);

    return {
      items,
      pagination,
    };
  },

  async streamNotifications(since?: string): Promise<SseNotificationEvent[]> {
    const payload = await apiClient.get<ApiResult<SseNotificationEvent>>(
      "/v1/notifications/stream",
      {
        params: since ? { since } : undefined,
      }
    );

    const rawData = isWrappedPayload(payload) ? payload.data : payload;
    return Array.isArray(rawData) ? rawData : rawData ? [rawData] : [];
  },
};
