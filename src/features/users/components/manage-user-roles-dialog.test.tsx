import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";

import esMessages from "@/i18n/messages/es";
import { notify } from "@/shared/utils/notify";

import { userRolesApi } from "../api/user-roles.api";
import type { User } from "../types/user";
import { ManageUserRolesDialog } from "./manage-user-roles-dialog";

vi.mock("../api/user-roles.api", () => ({
  userRolesApi: {
    getUserRoles: vi.fn(),
    updateUserRoles: vi.fn(),
  },
}));

vi.mock("@/shared/utils/notify", () => ({
  notify: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockUser: User = {
  id: "user-1",
  email: "juan@example.com",
  firstName: "Juan",
  lastName: "Pérez",
  phoneNumber: "+573001234567",
  status: "ACTIVE",
  roles: ["PARTICIPANT"],
};

function renderDialog(props: {
  user?: User | null;
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale="es" messages={esMessages}>
        <ManageUserRolesDialog
          user={props.user !== undefined ? props.user : mockUser}
          isOpen={props.isOpen ?? true}
          onClose={props.onClose ?? vi.fn()}
          onSuccess={props.onSuccess ?? vi.fn()}
        />
      </NextIntlClientProvider>
    </QueryClientProvider>
  );
}

describe("ManageUserRolesDialog", () => {
  it("renders user information and assignable roles when open", async () => {
    vi.mocked(userRolesApi.getUserRoles).mockResolvedValue({
      userId: "user-1",
      roles: ["KEY_MAN"],
    });

    renderDialog({});

    expect(screen.getByText(/Gestionar roles de Juan Pérez/i)).toBeInTheDocument();
    expect(screen.getByText("juan@example.com")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Hombre Clave")).toBeInTheDocument();
      expect(screen.getByText("Coordinador")).toBeInTheDocument();
    });
  });

  it("submits updated roles and notifies success", async () => {
    vi.mocked(userRolesApi.getUserRoles).mockResolvedValue({
      userId: "user-1",
      roles: ["PARTICIPANT"],
    });
    vi.mocked(userRolesApi.updateUserRoles).mockResolvedValue({
      userId: "user-1",
      roles: ["COORDINATOR"],
    });

    const onSuccess = vi.fn();
    const onClose = vi.fn();
    const user = userEvent.setup();

    renderDialog({ onSuccess, onClose });

    await waitFor(() => {
      expect(screen.getByText("Coordinador")).toBeInTheDocument();
    });

    // Click coordinator card
    const coordinatorCard = screen.getByText("Coordinador").closest('[role="checkbox"]');
    expect(coordinatorCard).not.toBeNull();
    if (coordinatorCard) {
      await user.click(coordinatorCard);
    }

    // Click submit
    const saveButton = screen.getByRole("button", { name: /Guardar cambios/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(userRolesApi.updateUserRoles).toHaveBeenCalledWith("user-1", {
        roles: ["COORDINATOR"],
      });
      expect(notify.success).toHaveBeenCalledWith("Roles actualizados exitosamente");
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("does not render when isOpen is false", () => {
    renderDialog({ isOpen: false });
    expect(screen.queryByText(/Gestionar roles/i)).not.toBeInTheDocument();
  });
});
