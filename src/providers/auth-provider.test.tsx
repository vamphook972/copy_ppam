import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider, useAuth } from "@/providers/auth-provider";
import { PermissionProvider, usePermission } from "@/providers/permission-provider";
import { SessionProvider, useSession } from "@/providers/session-provider";
import { permissionService } from "@/features/auth";
import { PermissionState } from "@/features/auth/types/permission";
import { authClient } from "@/lib/auth";
import { server } from "@/test/msw/server";

vi.mock("@/lib/auth", () => ({
  authClient: {
    initialize: vi.fn(),
    getSession: vi.fn(),
    signInWithCredentials: vi.fn(),
    signInWithProvider: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    changePassword: vi.fn(),
    signOut: vi.fn(),
  },
}));

vi.mock("@/features/auth", () => ({
  permissionService: {
    getMyPermissions: vi.fn(),
  },
}));

const emptyPermissionState: PermissionState = {
  isAdmin: false,
  menu: [],
  permissions: [],
};

function AuthConsumer() {
  const { signInWithCredentials, signOut } = useAuth();
  const { session } = useSession();
  const { permissions, refreshPermissions } = usePermission();

  return (
    <div>
      <button
        type="button"
        onClick={async () => {
          try {
            await signInWithCredentials({ email: "user@appam.test", password: "Secret123!" });
          } catch {
            // ignore
          }
        }}
      >
        login
      </button>
      <button
        type="button"
        onClick={async () => {
          await signOut();
        }}
      >
        logout
      </button>
      <button
        type="button"
        onClick={async () => {
          await refreshPermissions();
        }}
      >
        refresh-permissions
      </button>
      <span data-testid="authenticated">{String(session?.isAuthenticated ?? false)}</span>
      <span data-testid="permissions-count">{permissions.length}</span>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates session on successful credential login and clears everything on logout (correcto, elimina cookie, cache y permisos)", async () => {
    let sessionApiCalled = false;
    let deleteApiCalled = false;

    server.use(
      http.post("/api/auth/session", async () => {
        sessionApiCalled = true;
        return HttpResponse.json({ ok: true });
      }),
      http.delete("/api/auth/session", async () => {
        deleteApiCalled = true;
        return HttpResponse.json({ ok: true });
      })
    );

    vi.mocked(authClient.initialize).mockResolvedValue(undefined);
    vi.mocked(authClient.getSession).mockResolvedValue(null);
    vi.mocked(authClient.signInWithCredentials).mockResolvedValue({
      session: {
        user: null,
        tokens: {
          accessToken: "access",
          idToken: "id",
          expiresAt: 12345,
        },
        isAuthenticated: true,
      },
      nextStep: undefined,
    });
    vi.mocked(authClient.signOut).mockResolvedValue(undefined);
    vi.mocked(permissionService.getMyPermissions).mockResolvedValue({
      isAdmin: false,
      permissions: ["user:read"],
      menu: [],
    });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <AuthProvider>
            <PermissionProvider>
              <AuthConsumer />
            </PermissionProvider>
          </AuthProvider>
        </SessionProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(authClient.initialize).toHaveBeenCalled();
      expect(authClient.getSession).toHaveBeenCalled();
    });

    expect(screen.getByTestId("authenticated").textContent).toBe("false");

    // Login successfully
    fireEvent.click(screen.getByText("login"));

    await waitFor(() => {
      expect(screen.getByTestId("authenticated").textContent).toBe("true");
      expect(sessionApiCalled).toBe(true);
    });

    // Populate permissions
    fireEvent.click(screen.getByText("refresh-permissions"));
    await waitFor(() => {
      expect(screen.getByTestId("permissions-count").textContent).toBe("1");
    });

    // Add query cache to verify it gets cleared
    queryClient.setQueryData(["test-query"], { data: "cached-data" });
    expect(queryClient.getQueryData(["test-query"])).toBeDefined();

    // Logout
    fireEvent.click(screen.getByText("logout"));

    await waitFor(() => {
      expect(screen.getByTestId("authenticated").textContent).toBe("false");
      expect(deleteApiCalled).toBe(true);
      // Cache is cleared
      expect(queryClient.getQueryData(["test-query"])).toBeUndefined();
    });

    // Permissions remain until an explicit refresh/clear is requested
    vi.mocked(permissionService.getMyPermissions).mockResolvedValue(emptyPermissionState);
    fireEvent.click(screen.getByText("refresh-permissions"));

    await waitFor(() => {
      expect(screen.getByTestId("permissions-count").textContent).toBe("0");
    });
  });

  it("handles failed login gracefully (incorrecto)", async () => {
    vi.mocked(authClient.initialize).mockResolvedValue(undefined);
    vi.mocked(authClient.getSession).mockResolvedValue(null);
    vi.mocked(authClient.signInWithCredentials).mockRejectedValue(
      new Error("Incorrect credentials")
    );

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <AuthProvider>
            <PermissionProvider>
              <AuthConsumer />
            </PermissionProvider>
          </AuthProvider>
        </SessionProvider>
      </QueryClientProvider>
    );

    fireEvent.click(screen.getByText("login"));

    await waitFor(() => {
      expect(screen.getByTestId("authenticated").textContent).toBe("false");
    });
  });
});
