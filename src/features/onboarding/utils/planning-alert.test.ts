import { describe, expect, it } from "vitest";

import type { PlanningGoals } from "../types/planning-indicator";
import { resolvePlanningAlertLevel, resolvePlanningAlertReasons } from "./planning-alert";

const goals: PlanningGoals = {
  maxFormsPending: 40,
  maxDaysWithoutCapacitation: 180,
};

describe("resolvePlanningAlertReasons", () => {
  it("raises the red alert on the day goal even when the form goal is not reached (HU scenario)", () => {
    const input = { pendingForms: 30, daysWithoutCapacitation: 180, goals };

    expect(resolvePlanningAlertReasons(input)).toEqual(["days"]);
    expect(resolvePlanningAlertLevel(input)).toBe("critical");
  });

  it("raises the red alert on the form goal even when the day goal is not reached", () => {
    expect(
      resolvePlanningAlertReasons({ pendingForms: 40, daysWithoutCapacitation: 12, goals })
    ).toEqual(["forms"]);
  });

  it("reports both reasons when both goals are reached", () => {
    expect(
      resolvePlanningAlertReasons({ pendingForms: 55, daysWithoutCapacitation: 200, goals })
    ).toEqual(["forms", "days"]);
  });

  it("stays purple only while both values are below the goal", () => {
    expect(
      resolvePlanningAlertLevel({ pendingForms: 39, daysWithoutCapacitation: 179, goals })
    ).toBe("calm");
    expect(
      resolvePlanningAlertLevel({ pendingForms: 40, daysWithoutCapacitation: 179, goals })
    ).toBe("critical");
    expect(
      resolvePlanningAlertLevel({ pendingForms: 39, daysWithoutCapacitation: 180, goals })
    ).toBe("critical");
  });

  it("does not raise the day alert when no orientation meeting has been held", () => {
    expect(
      resolvePlanningAlertReasons({ pendingForms: 5, daysWithoutCapacitation: null, goals })
    ).toEqual([]);
  });

  it("still raises the form alert when no orientation meeting has been held", () => {
    expect(
      resolvePlanningAlertReasons({ pendingForms: 41, daysWithoutCapacitation: null, goals })
    ).toEqual(["forms"]);
  });

  it("honours goals customised per city", () => {
    const cali: PlanningGoals = { maxFormsPending: 10, maxDaysWithoutCapacitation: 30 };

    expect(
      resolvePlanningAlertLevel({ pendingForms: 10, daysWithoutCapacitation: 1, goals: cali })
    ).toBe("critical");
  });
});
