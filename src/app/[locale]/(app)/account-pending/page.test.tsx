import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import esAuth from "@/i18n/messages/es/auth.json";

import AccountPendingPage from "./page";

const mockReplace = vi.fn();
const mockSignOut = vi.fn();
const mockRefreshPermissions = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
}));

function getNestedValue(obj: unknown, path: string): string {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (!current || typeof current !== "object") return path;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : path;
}

vi.mock("next-intl", () => ({
  useLocale: () => "es",
  useTranslations: () => (key: string) => getNestedValue(esAuth.accountPending, key),
}));

const mockUsePermission = vi.fn();
const mockUseAuth = vi.fn();

vi.mock("@/providers", () => ({
  usePermission: () => mockUsePermission(),
  useAuth: () => mockUseAuth(),
}));

describe("AccountPendingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      signOut: mockSignOut,
    });
  });

  it("renders pending form status message correctly using i18n", () => {
    mockUsePermission.mockReturnValue({
      user: {
        fullName: "Hermano Ejemplo",
        email: "ejemplo@test.com",
        status: {
          code: "PENDING_FORM",
          name: "Pendiente de Formulario S-73",
        },
      },
      isAdmin: false,
      refreshPermissions: mockRefreshPermissions,
      isLoading: false,
    });

    render(<AccountPendingPage />);

    expect(screen.getAllByText("Pendiente de Formulario S-73").length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText(/está pendiente la entrega o aprobación de tu formulario/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Hermano Ejemplo")).toBeInTheDocument();
  });

  it("renders rejected status message correctly using i18n", () => {
    mockUsePermission.mockReturnValue({
      user: {
        fullName: "Participante Rechazado",
        email: "rechazado@test.com",
        status: {
          code: "REJECTED",
          name: "Rechazado",
        },
      },
      isAdmin: false,
      refreshPermissions: mockRefreshPermissions,
      isLoading: false,
    });

    render(<AccountPendingPage />);

    expect(screen.getByText("Solicitud No Aprobada")).toBeInTheDocument();
    expect(screen.getByText(/no ha sido aprobada/i)).toBeInTheDocument();
  });

  it("redirects to dashboard if user is already ACTIVE", () => {
    mockUsePermission.mockReturnValue({
      user: {
        fullName: "Usuario Activo",
        email: "activo@test.com",
        status: {
          code: "ACTIVE",
          name: "Activo",
        },
      },
      isAdmin: false,
      refreshPermissions: mockRefreshPermissions,
      isLoading: false,
    });

    render(<AccountPendingPage />);

    expect(mockReplace).toHaveBeenCalledWith("/es/dashboard");
  });

  it("calls refreshPermissions when clicking 'Verificar estado'", async () => {
    mockUsePermission.mockReturnValue({
      user: {
        fullName: "Hermano Ejemplo",
        email: "ejemplo@test.com",
        status: {
          code: "PENDING_CAPACITATION",
          name: "Pendiente de Capacitación",
        },
      },
      isAdmin: false,
      refreshPermissions: mockRefreshPermissions,
      isLoading: false,
    });

    render(<AccountPendingPage />);

    const refreshButton = screen.getByRole("button", { name: /verificar estado/i });
    fireEvent.click(refreshButton);

    expect(mockRefreshPermissions).toHaveBeenCalledTimes(1);
  });

  it("calls signOut when clicking 'Cerrar sesión'", async () => {
    mockUsePermission.mockReturnValue({
      user: {
        fullName: "Hermano Ejemplo",
        email: "ejemplo@test.com",
        status: {
          code: "IN_TRAINING",
          name: "En Entrenamiento",
        },
      },
      isAdmin: false,
      refreshPermissions: mockRefreshPermissions,
      isLoading: false,
    });

    render(<AccountPendingPage />);

    const signOutButton = screen.getByRole("button", { name: /cerrar sesión/i });
    fireEvent.click(signOutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith("/es/login");
    });
  });
});
