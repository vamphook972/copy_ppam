import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";

import esMessages from "@/i18n/messages/es";

import { rolesApi } from "../api/roles.api";
import type { Role } from "../types/role";
import { RoleCard } from "./role-card";

vi.mock("../api/roles.api", () => ({
  rolesApi: {
    getUsersByRole: vi.fn(),
  },
}));

const mockRole: Role = {
  id: "role-1",
  name: "COORDINATOR",
  isSystem: true,
  category: "ADMINISTRATION",
};

function renderCard(props: {
  role?: Role;
  onViewMembers?: (role: Role) => void;
  onManagePermissions?: (role: Role) => void;
}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale="es" messages={esMessages}>
        <RoleCard
          role={props.role ?? mockRole}
          onViewMembers={props.onViewMembers ?? vi.fn()}
          onManagePermissions={props.onManagePermissions ?? vi.fn()}
        />
      </NextIntlClientProvider>
    </QueryClientProvider>
  );
}

describe("RoleCard", () => {
  it("renders role name, category badge and view members button", async () => {
    vi.mocked(rolesApi.getUsersByRole).mockResolvedValue({
      items: [],
      pagination: {
        page: 1,
        pageSize: 1,
        total: 5,
        totalItems: 5,
        totalPages: 5,
        hasNext: true,
        hasPrevious: false,
      },
    });

    const onViewMembers = vi.fn();
    const onManagePermissions = vi.fn();
    const user = userEvent.setup();

    renderCard({ onViewMembers, onManagePermissions });

    expect(screen.getByText("Coordinador")).toBeInTheDocument();
    expect(screen.getByText("Administración")).toBeInTheDocument();

    const viewButton = screen.getByRole("button", { name: /Ver miembros/i });
    expect(viewButton).toBeInTheDocument();

    await user.click(viewButton);
    expect(onViewMembers).toHaveBeenCalledWith(mockRole);

    const permButton = screen.getByRole("button", { name: /Permisos/i });
    expect(permButton).toBeInTheDocument();

    await user.click(permButton);
    expect(onManagePermissions).toHaveBeenCalledWith(mockRole);
  });
});
