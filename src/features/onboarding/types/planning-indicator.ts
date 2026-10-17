/**
 * "Alerta Roja" when either goal is reached, "Alerta Morada" while both
 * stay below it.
 */
export type PlanningAlertLevel = "critical" | "calm";

export type PlanningAlertReason = "forms" | "days";

export interface PlanningGoals {
  maxFormsPending: number;
  maxDaysWithoutCapacitation: number;
}

/** Response body of `GET /v1/enrollments/planning-metrics`. */
export interface PlanningMetricsDto {
  pendingForms: number;
  lastOrientationAt: string | null;
  daysWithoutCapacitation: number | null;
}

export interface PlanningMetrics {
  /** S-73 requests still pending. */
  pendingForms: number;
  lastOrientationAt: string | null;
  /** Days since the last completed orientation meeting, null when there is none. */
  daysWithoutCapacitation: number | null;
}

export interface PlanningIndicator extends PlanningMetrics {
  goals: PlanningGoals;
  level: PlanningAlertLevel;
  reasons: PlanningAlertReason[];
}
