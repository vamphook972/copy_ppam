import { apiClient } from "@/lib/http";

import { mapPlanningMetricsDtoToPlanningMetrics } from "../mappers/planning-metrics.mapper";
import type { PlanningMetrics, PlanningMetricsDto } from "../types/planning-indicator";

interface ApiWrappedPayload<T> {
  data: T;
}

type ApiResult<T> = ApiWrappedPayload<T> | T;

function unwrapPayload<T>(payload: ApiResult<T>): T {
  if (typeof payload === "object" && payload !== null && "data" in payload) {
    return (payload as ApiWrappedPayload<T>).data;
  }
  return payload as T;
}

export const planningIndicatorApi = {
  async getPlanningMetrics(): Promise<PlanningMetrics> {
    const payload = await apiClient.get<ApiResult<PlanningMetricsDto>>(
      "/v1/enrollments/planning-metrics"
    );

    return mapPlanningMetricsDtoToPlanningMetrics(unwrapPayload(payload));
  },
};
