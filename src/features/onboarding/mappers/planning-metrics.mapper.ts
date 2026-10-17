import type { PlanningMetrics, PlanningMetricsDto } from "../types/planning-indicator";

export function mapPlanningMetricsDtoToPlanningMetrics(dto: PlanningMetricsDto): PlanningMetrics {
  return {
    pendingForms: dto.pendingForms,
    lastOrientationAt: dto.lastOrientationAt,
    daysWithoutCapacitation: dto.daysWithoutCapacitation,
  };
}
