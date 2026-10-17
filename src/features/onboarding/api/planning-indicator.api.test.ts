import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { authClient } from "@/lib/auth";
import { server } from "@/test/msw/server";
import type { Session } from "@/types/auth";

import { planningIndicatorApi } from "./planning-indicator.api";

vi.mock("@/lib/auth", () => ({
  authClient: {
    getSession: vi.fn(),
  },
}));

// Body returned by the real enrollment-service handler running against PostgreSQL.
const BACKEND_RESPONSE = {
  data: {
    pendingForms: 3,
    lastOrientationAt: "2026-03-16T20:48:00.181Z",
    daysWithoutCapacitation: 180,
  },
  meta: { correlationId: "planning-integration" },
};

describe("planningIndicatorApi.getPlanningMetrics", () => {
  beforeEach(() => {
    vi.mocked(authClient.getSession).mockResolvedValue({
      user: null,
      permissions: [],
      menu: [],
      isAdmin: false,
      isAuthenticated: true,
      tokens: {
        accessToken: "access-token",
        idToken: "id-token",
      },
    } as Session);
  });

  it("reads the metrics from the backend envelope with the session token and no tenantId", async () => {
    let requestUrl: URL | undefined;
    let authorization: string | null = null;

    server.use(
      http.get("*/v1/enrollments/planning-metrics", ({ request }) => {
        requestUrl = new URL(request.url);
        authorization = request.headers.get("authorization");
        return HttpResponse.json(BACKEND_RESPONSE);
      })
    );

    await expect(planningIndicatorApi.getPlanningMetrics()).resolves.toEqual(BACKEND_RESPONSE.data);
    expect(authorization).toBe("Bearer access-token");
    expect(requestUrl?.searchParams.has("tenantId")).toBe(false);
  });
});
