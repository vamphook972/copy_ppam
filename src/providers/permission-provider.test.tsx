import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PermissionProvider, usePermission } from "@/providers/permission-provider";
import { SessionProvider } from "@/providers/session-provider";
import { permissionService } from "@/features/auth";
import { authClient } from "@/lib/auth";

vi.mock("@/lib/auth", () => ({
  authClient: {
    initialize: vi.fn(),
    getSession: vi.fn(),
    refreshSession: vi.fn(),
  },
}));

vi.mock("@/features/auth", () => ({
  permissionService: {
    getMyPermissions: vi.fn(),
  },
}));

function PermissionConsumer() {
  const { can, permissions, refreshPermissions, clearPermissions, isAdmin } = usePermission();

  return (
    <div>
      <button
        type="button"
        onClick={async () => {
          await refreshPermissions();
        }}
      >
        refresh
      </button>
      <button
        type="button"
        onClick={() => {
          clearPermissions();
        }}
      >
        clear
      </button>
      <span data-testid="can-users-view">{String(can("user:read"))}</span>
      <span data-testid="permissions-count">{String(permissions.length)}</span>
      <span data-testid="session-admin">{String(isAdmin)}</span>
    </div>
  );
}

describe("PermissionProvider", () => {
  it("refreshes permissions and updates capabilities", async () => {
    vi.mocked(authClient.initialize).mockResolvedValue(undefined);
    vi.mocked(authClient.getSession).mockResolvedValue({
      user: null,
      tokens: undefined,
      isAuthenticated: true,
    });
    vi.mocked(permissionService.getMyPermissions).mockResolvedValue({
      isAdmin: true,
      menu: [],
      permissions: ["user:read"],
    });

    render(
      <SessionProvider>
        <PermissionProvider>
          <PermissionConsumer />
        </PermissionProvider>
      </SessionProvider>
    );

    await waitFor(() => {
      expect(authClient.initialize).toHaveBeenCalled();
      expect(authClient.getSession).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByText("refresh"));

    await waitFor(() => {
      expect(screen.getByTestId("can-users-view").textContent).toBe("true");
      expect(screen.getByTestId("permissions-count").textContent).toBe("1");
      expect(screen.getByTestId("session-admin").textContent).toBe("true");
    });

    fireEvent.click(screen.getByText("clear"));

    await waitFor(() => {
      expect(screen.getByTestId("permissions-count").textContent).toBe("0");
    });
  });
});
