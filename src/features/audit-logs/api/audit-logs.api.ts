import { apiClient } from "@/lib/http";
import { extractPagination, type Pagination } from "@/shared/types/api";

import type { AuditLogDto, AuditLogsListResponse, AuditLogsQueryParams } from "../types/audit-logs";

const AUDIT_LOGS_ENDPOINT = "/v1/audit-logs";

interface ApiWrappedPayload<T> {
  data: T[] | T;
  pagination?: Pagination;
}

type ApiResult<T> = ApiWrappedPayload<T> | T[] | T;

function isWrappedPayload<T>(payload: ApiResult<T>): payload is ApiWrappedPayload<T> {
  return typeof payload === "object" && payload !== null && "data" in payload;
}

export const auditLogsApi = {
  async list(params: AuditLogsQueryParams): Promise<AuditLogsListResponse> {
    const payload = await apiClient.get<ApiResult<AuditLogDto>>(AUDIT_LOGS_ENDPOINT, {
      params: params as Record<string, unknown>,
    });

    const rawData = isWrappedPayload(payload) ? payload.data : payload;
    const items = Array.isArray(rawData) ? rawData : [];
    const pagination = extractPagination(payload, params, items.length);

    return {
      items,
      pagination,
    };
  },
};
