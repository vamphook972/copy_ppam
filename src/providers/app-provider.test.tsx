import { render, screen, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { AppProvider } from "@/providers";
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

function AppConsumer() {
  return <div data-testid="app-provider-mounted">ok</div>;
}

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe("AppProvider composition", () => {
  it("renders children with provider composition mounted", async () => {
    vi.mocked(authClient.initialize).mockResolvedValue(undefined);
    vi.mocked(authClient.getSession).mockResolvedValue(null);

    render(
      <AppProvider>
        <AppConsumer />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("app-provider-mounted")).toBeInTheDocument();
    });
  });
});
