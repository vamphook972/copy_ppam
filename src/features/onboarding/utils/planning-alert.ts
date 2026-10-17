import type {
  PlanningAlertLevel,
  PlanningAlertReason,
  PlanningGoals,
} from "../types/planning-indicator";

export interface PlanningAlertInput {
  pendingForms: number;
  daysWithoutCapacitation: number | null;
  goals: PlanningGoals;
}

/**
 * Which goals were reached. Both comparisons are inclusive, so "exactly
 * 180 days" already counts, and reaching either one is enough.
 */
export function resolvePlanningAlertReasons({
  pendingForms,
  daysWithoutCapacitation,
  goals,
}: PlanningAlertInput): PlanningAlertReason[] {
  const reasons: PlanningAlertReason[] = [];

  if (pendingForms >= goals.maxFormsPending) {
    reasons.push("forms");
  }

  if (
    daysWithoutCapacitation !== null &&
    daysWithoutCapacitation >= goals.maxDaysWithoutCapacitation
  ) {
    reasons.push("days");
  }

  return reasons;
}

/**
 * The indicator carries a single state: red as soon as one goal is reached,
 * purple only while both stay below.
 */
export function resolvePlanningAlertLevel(input: PlanningAlertInput): PlanningAlertLevel {
  return resolvePlanningAlertReasons(input).length > 0 ? "critical" : "calm";
}
