import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";

import esMessages from "@/i18n/messages/es";

import type { PlanningIndicator } from "../types/planning-indicator";
import { PlanningBoard } from "./planning-board";

const usePlanningIndicatorMock = vi.fn();

vi.mock("../hooks/use-planning-indicator", () => ({
  usePlanningIndicator: () => usePlanningIndicatorMock() as unknown,
}));

const RED_SELECTOR = '[class*="border-destructive/50"]';
const PURPLE_SELECTOR = '[class*="border-planning-calm/50"]';
const ALERT_TITLE = "TIENES NOTIFICACIONES PENDIENTES POR VER";
const FORMS_LABEL = "Formularios vigentes pendientes";
const DAYS_LABEL = "Días sin capacitación";

function cardColor(label: string): "red" | "purple" | "none" {
  const card = screen.getByText(label).closest('[class*="rounded-xl"]');

  if (card?.matches(RED_SELECTOR)) return "red";
  if (card?.matches(PURPLE_SELECTOR)) return "purple";
  return "none";
}

function buildIndicator(overrides: Partial<PlanningIndicator> = {}): PlanningIndicator {
  return {
    pendingForms: 12,
    daysWithoutCapacitation: 20,
    lastOrientationAt: "2026-08-15T10:00:00.000Z",
    goals: { maxFormsPending: 40, maxDaysWithoutCapacitation: 180 },
    level: "calm",
    reasons: [],
    ...overrides,
  };
}

function renderBoard(data: PlanningIndicator) {
  usePlanningIndicatorMock.mockReturnValue({
    data,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  });

  return render(
    <NextIntlClientProvider locale="es" messages={esMessages}>
      <PlanningBoard />
    </NextIntlClientProvider>
  );
}

describe("PlanningBoard", () => {
  beforeEach(() => {
    usePlanningIndicatorMock.mockReset();
  });

  it("paints only the days card red and shows the notice on the HU scenario", () => {
    renderBoard(
      buildIndicator({
        pendingForms: 30,
        daysWithoutCapacitation: 180,
        level: "critical",
        reasons: ["days"],
      })
    );

    expect(cardColor(DAYS_LABEL)).toBe("red");
    expect(cardColor(FORMS_LABEL)).toBe("purple");
    expect(screen.getByText(ALERT_TITLE)).toBeInTheDocument();
    expect(
      screen.getByText(/Ya es posible hacer una nueva capacitación de la PPAM/)
    ).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("180")).toBeInTheDocument();
  });

  it("paints only the forms card red when only the form goal is reached", () => {
    renderBoard(
      buildIndicator({
        pendingForms: 40,
        daysWithoutCapacitation: 20,
        level: "critical",
        reasons: ["forms"],
      })
    );

    expect(cardColor(FORMS_LABEL)).toBe("red");
    expect(cardColor(DAYS_LABEL)).toBe("purple");
    expect(screen.getByText(ALERT_TITLE)).toBeInTheDocument();
  });

  it("paints both cards red when both goals are reached", () => {
    renderBoard(
      buildIndicator({
        pendingForms: 55,
        daysWithoutCapacitation: 200,
        level: "critical",
        reasons: ["forms", "days"],
      })
    );

    expect(cardColor(FORMS_LABEL)).toBe("red");
    expect(cardColor(DAYS_LABEL)).toBe("red");
    expect(screen.getByText(ALERT_TITLE)).toBeInTheDocument();
  });

  it("links the notice to the enrollments screen", () => {
    renderBoard(buildIndicator({ pendingForms: 41, level: "critical", reasons: ["forms"] }));

    expect(screen.getByRole("link", { name: "da click aquí" })).toHaveAttribute(
      "href",
      "/es/enrollments"
    );
  });

  it("paints both cards purple and hides the notice while both goals are below", () => {
    renderBoard(buildIndicator());

    expect(cardColor(FORMS_LABEL)).toBe("purple");
    expect(cardColor(DAYS_LABEL)).toBe("purple");
    expect(screen.queryByText(ALERT_TITLE)).not.toBeInTheDocument();
  });

  it("shows the configured city goals", () => {
    renderBoard(buildIndicator());

    expect(screen.getByText("Meta de la ciudad: 40")).toBeInTheDocument();
    expect(screen.getByText("Meta de la ciudad: 180 días")).toBeInTheDocument();
  });

  it("renders a placeholder when the city has no orientation meeting yet", () => {
    renderBoard(buildIndicator({ daysWithoutCapacitation: null, lastOrientationAt: null }));

    expect(screen.getByText("Sin registro")).toBeInTheDocument();
  });

  it("offers a retry when the indicators cannot be loaded", () => {
    usePlanningIndicatorMock.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      refetch: vi.fn(),
    });

    render(
      <NextIntlClientProvider locale="es" messages={esMessages}>
        <PlanningBoard />
      </NextIntlClientProvider>
    );

    expect(screen.getByText("No pudimos calcular los indicadores")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });
});
