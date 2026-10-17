import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SessionProvider, useSession } from "@/providers/session-provider";
import { authClient } from "@/lib/auth";

vi.mock("@/lib/auth", () => ({
  authClient: {
    initialize: vi.fn(),
    getSession: vi.fn(),
    refreshSession: vi.fn(),
  },
}));

function SessionConsumer() {
  const { session, isLoading } = useSession();

  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="authenticated">{String(session?.isAuthenticated ?? false)}</span>
    </div>
  );
}

describe("SessionProvider", () => {
  it("bootstraps and exposes session", async () => {
    vi.mocked(authClient.initialize).mockResolvedValue(undefined);
    vi.mocked(authClient.getSession).mockResolvedValue({
      user: null,
      tokens: undefined,
      isAuthenticated: true,
    });

    render(
      <SessionProvider>
        <SessionConsumer />
      </SessionProvider>
    );

    expect(screen.getByTestId("loading").textContent).toBe("true");

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
      expect(screen.getByTestId("authenticated").textContent).toBe("true");
    });
  });
});
