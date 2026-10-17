import type { Pagination } from "@/shared/types/api";

interface ApiWrappedPayload<T> {
  data: T[] | T;
  pagination?: Pagination;
}

export type ApiResult<T> = ApiWrappedPayload<T> | T[] | T;

export function isWrappedPayload<T>(payload: ApiResult<T>): payload is ApiWrappedPayload<T> {
  return typeof payload === "object" && payload !== null && "data" in payload;
}

export function unwrapResponse<T>(response: unknown): T {
  if (response && typeof response === "object") {
    const r = response as Record<string, unknown>;
    if (r["error"] && typeof r["error"] === "object") {
      const err = r["error"] as Record<string, unknown>;
      throw new Error(typeof err["message"] === "string" ? err["message"] : "An error occurred");
    }
    if (r["success"] === false) {
      throw new Error(typeof r["message"] === "string" ? r["message"] : "An error occurred");
    }
  }

  return response as T;
}
