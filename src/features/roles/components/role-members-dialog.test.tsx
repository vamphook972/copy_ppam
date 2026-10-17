import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";

import esMessages from "@/i18n/messages/es";

import { rolesApi } from "../api/roles.api";
import type { Role } from "../types/role";
import { RoleMembersDialog } from "./role-members-dialog";

vi.mock("@/providers", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/providers")>()),
  usePermission: () => ({
    can: () => true,
    canAny: () => true,
    isAdmin: true,
  }),
}));

vi.mock("../api/roles.api", () => ({
  rolesApi: {
    getUsersByRole: vi.fn(),
  },
}));

vi.mock("@/features/users", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/users")>();
  return {
    ...actual,
    ManageUserRolesDialog: () => <div data-testid="mock-manage-roles-dialog" />,
  };
});

const mockRole: Role = {
  id: "role-km",
  name: "KEY_MAN",
  isSystem: false,
  category: "OPERATIONS",
};

function renderDialog(props: { role?: Role | null; isOpen?: boolean; onClose?: () => void }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale="es" messages={esMessages}>
        <RoleMembersDialog
          role={props.role !== undefined ? props.role : mockRole}
          isOpen={props.isOpen ?? true}
          onClose={props.onClose ?? vi.fn()}
        />
      </NextIntlClientProvider>
    </QueryClientProvider>
  );
}

describe("RoleMembersDialog", () => {
  it("renders assigned users in role", async () => {
    vi.mocked(rolesApi.getUsersByRole).mockResolvedValue({
      items: [
        {
          id: "u-1",
          email: "pedro@example.com",
          firstName: "Pedro",
          lastName: "Gómez",
          phoneNumber: "+573000000000",
          status: "ACTIVE",
          roles: ["KEY_MAN"],
        },
      ],
      pagination: {
        page: 1,
        pageSize: 50,
        total: 1,
        totalItems: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
    });

    renderDialog({});

    expect(screen.getByText(/Miembros del Rol: Hombre Clave/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Pedro Gómez")).toBeInTheDocument();
      expect(screen.getByText("pedro@example.com")).toBeInTheDocument();
    });
  });

  it("renders empty state when role has no members", async () => {
    vi.mocked(rolesApi.getUsersByRole).mockResolvedValue({
      items: [],
      pagination: {
        page: 1,
        pageSize: 50,
        total: 0,
        totalItems: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      },
    });

    renderDialog({});

    await waitFor(() => {
      expect(screen.getByText("Sin miembros asignados")).toBeInTheDocument();
    });
  });

  it("does not render when isOpen is false", () => {
    renderDialog({ isOpen: false });
    expect(screen.queryByText(/Miembros del Rol/i)).not.toBeInTheDocument();
  });
});
