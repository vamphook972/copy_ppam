import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";

import esMessages from "@/i18n/messages/es";

import { rolesApi } from "../api/roles.api";
import type { Role } from "../types/role";
import { RolePermissionsDialog } from "./role-permissions-dialog";

vi.mock("../api/roles.api", () => ({
  rolesApi: {
    listAllPermissions: vi.fn(),
    getRolePermissions: vi.fn(),
    updateRolePermissions: vi.fn(),
    restoreRolePermissions: vi.fn(),
  },
}));

vi.mock("@/shared/utils/notify", () => ({
  notify: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockRole: Role = {
  id: "role-1",
  name: "KEY_MAN",
  isSystem: true,
  category: "OPERATIONS",
};

const mockCoordinatorRole: Role = {
  id: "role-coord",
  name: "COORDINATOR",
  isSystem: true,
  category: "ADMINISTRATION",
};

function renderDialog(props: { role?: Role | null; isOpen?: boolean; onClose?: () => void }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale="es" messages={esMessages}>
        <RolePermissionsDialog
          role={props.role !== undefined ? props.role : mockRole}
          isOpen={props.isOpen ?? true}
          onClose={props.onClose ?? vi.fn()}
        />
      </NextIntlClientProvider>
    </QueryClientProvider>
  );
}

describe("RolePermissionsDialog", () => {
  it("renders permission dialog and saves modified permissions", async () => {
    vi.mocked(rolesApi.listAllPermissions).mockResolvedValue([
      { id: "p-1", action: "place:read", description: "Ver lugares" },
      { id: "p-2", action: "place:create", description: "Crear lugares" },
      { id: "p-3", action: "user:read", description: "Ver usuarios" },
    ]);
    vi.mocked(rolesApi.getRolePermissions).mockResolvedValue([
      { id: "p-1", action: "place:read", description: "Ver lugares" },
    ]);
    vi.mocked(rolesApi.updateRolePermissions).mockResolvedValue(undefined);

    const onClose = vi.fn();
    const user = userEvent.setup();

    renderDialog({ role: mockRole, onClose });

    // Verify title and search input
    expect(await screen.findByText(/Permisos del Rol: Hombre Clave/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Buscar permisos o acciones/i)).toBeInTheDocument();

    // Toggle a permission checkbox
    const placeCreateCheckbox = await screen.findByLabelText("place:create");
    expect(placeCreateCheckbox).not.toBeChecked();

    // Click on place:create to select it
    await user.click(placeCreateCheckbox);
    expect(placeCreateCheckbox).toBeChecked();

    // Save button should be enabled
    const saveButton = screen.getByRole("button", { name: /Guardar permisos/i });
    expect(saveButton).toBeEnabled();

    await user.click(saveButton);
    expect(rolesApi.updateRolePermissions).toHaveBeenCalledWith(
      mockRole.id,
      expect.arrayContaining(["p-1", "p-2"])
    );
  });

  it("disables protected permissions for COORDINATOR role", async () => {
    vi.mocked(rolesApi.listAllPermissions).mockResolvedValue([
      { id: "p-role-read", action: "role:read", description: "Ver roles" },
      { id: "p-user-read", action: "user:read", description: "Ver usuarios" },
      { id: "p-place-read", action: "place:read", description: "Ver lugares" },
    ]);
    vi.mocked(rolesApi.getRolePermissions).mockResolvedValue([
      { id: "p-role-read", action: "role:read", description: "Ver roles" },
      { id: "p-user-read", action: "user:read", description: "Ver usuarios" },
    ]);

    renderDialog({ role: mockCoordinatorRole });

    expect(await screen.findByText(/Permisos del Rol: Coordinador/i)).toBeInTheDocument();

    // Protected permissions (role:read, user:read) must be disabled
    expect(await screen.findByLabelText("role:read")).toBeDisabled();
    expect(screen.getByLabelText("user:read")).toBeDisabled();
    expect(screen.getByLabelText("place:read")).not.toBeDisabled();
  });
});
