import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";

import esMessages from "@/i18n/messages/es";

import { settingsApi } from "../api/settings.api";
import type { TenantSettings } from "../types/settings";
import { TenantConfigPanel } from "./tenant-config-panel";

vi.mock("@/providers", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/providers")>()),
  usePermission: () => ({
    can: () => true,
    isAdmin: true,
    user: { tenant: { id: "tenant-cali" } },
  }),
}));

vi.mock("../api/settings.api", () => ({
  settingsApi: {
    getSettings: vi.fn(),
    updateSettings: vi.fn(),
  },
}));

const FORMS_LABEL = "Número máximo de formularios pendientes";
const DAYS_LABEL = "Número máximo de días sin capacitación";
const SAVE_LABEL = "Guardar Cambios";
const INVITATION_LABEL = "Días de expiración de invitación";
const ZONES_LABEL = "Número máximo de zonas por encargado";

const SETTINGS: TenantSettings = {
  tenantId: "tenant-cali",
  tenantName: "Cali Metropolitana",
  status: "ACTIVE",
  general: {
    featureFlag: false,
    invitationExpiryDays: 7,
    maxZonesPerManager: 1,
    maxFormsPending: 40,
    maxDaysWithoutCapacitation: 180,
  },
  notifications: { whatsapp: false },
  privilegeLimits: {} as TenantSettings["privilegeLimits"],
  evaluationChecklist: [],
};

async function renderPanel() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  render(
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale="es" messages={esMessages}>
        <TenantConfigPanel />
      </NextIntlClientProvider>
    </QueryClientProvider>
  );

  const forms = await screen.findByLabelText(FORMS_LABEL);
  const days = screen.getByLabelText(DAYS_LABEL);

  await waitFor(() => expect(forms).toHaveValue("40"));

  return { forms, days, user: userEvent.setup() };
}

describe("TenantConfigPanel planning goals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(settingsApi.getSettings).mockResolvedValue(SETTINGS);
    vi.mocked(settingsApi.updateSettings).mockImplementation(async (data) => ({
      ...SETTINGS,
      general: { ...SETTINGS.general, ...data.general },
    }));
  });

  it("caps each goal at three digits", async () => {
    const { forms, days, user } = await renderPanel();

    expect(forms).toHaveAttribute("maxLength", "3");
    expect(days).toHaveAttribute("maxLength", "3");

    await user.clear(forms);
    await user.type(forms, "12345");

    expect(forms).toHaveValue("123");
  });

  it("drops letters, signs and decimal points while typing", async () => {
    const { forms, days, user } = await renderPanel();

    await user.clear(forms);
    await user.type(forms, "-4.5e");
    await user.clear(days);
    await user.type(days, "1a8b0");

    expect(forms).toHaveValue("45");
    expect(days).toHaveValue("180");
  });

  it("explains the allowed range in Spanish and does not save goals out of range", async () => {
    const { forms, days, user } = await renderPanel();

    await user.clear(forms);
    await user.type(forms, "5");
    await user.clear(days);
    await user.type(days, "400");
    await user.click(screen.getByRole("button", { name: SAVE_LABEL }));

    expect(await screen.findByText("Ingresa un número entero entre 10 y 100")).toBeInTheDocument();
    expect(screen.getByText("Ingresa un número entero entre 30 y 365")).toBeInTheDocument();
    expect(settingsApi.updateSettings).not.toHaveBeenCalled();
  });

  it("asks for a number when a goal is left empty", async () => {
    const { forms, user } = await renderPanel();

    await user.clear(forms);
    await user.click(screen.getByRole("button", { name: SAVE_LABEL }));

    expect(await screen.findByText("Ingresa un número entero entre 10 y 100")).toBeInTheDocument();
    expect(settingsApi.updateSettings).not.toHaveBeenCalled();
  });

  it("saves valid goals as numbers", async () => {
    const { forms, days, user } = await renderPanel();

    await user.clear(forms);
    await user.type(forms, "55");
    await user.clear(days);
    await user.type(days, "200");
    await user.click(screen.getByRole("button", { name: SAVE_LABEL }));

    await waitFor(() => expect(settingsApi.updateSettings).toHaveBeenCalledTimes(1));
    expect(vi.mocked(settingsApi.updateSettings).mock.calls[0]?.[0].general).toMatchObject({
      maxFormsPending: 55,
      maxDaysWithoutCapacitation: 200,
    });
  });

  it("applies the same rules to the other numeric settings", async () => {
    const { user } = await renderPanel();
    const invitation = screen.getByLabelText(INVITATION_LABEL);
    const zones = screen.getByLabelText(ZONES_LABEL);

    expect(invitation).toHaveAttribute("maxLength", "3");
    expect(zones).toHaveAttribute("maxLength", "2");

    await user.clear(invitation);
    await user.type(invitation, "400");
    await user.clear(zones);
    await user.type(zones, "99");
    await user.click(screen.getByRole("button", { name: SAVE_LABEL }));

    expect(await screen.findByText("Ingresa un número entero entre 1 y 365")).toBeInTheDocument();
    expect(screen.getByText("Ingresa un número entero entre 1 y 50")).toBeInTheDocument();
    expect(settingsApi.updateSettings).not.toHaveBeenCalled();
  });
});
