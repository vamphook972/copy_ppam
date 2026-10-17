import { describe, expect, it, vi } from "vitest";

import { permissionsApi } from "@/features/auth/api/permissions.api";
import { apiClient } from "@/lib/http";

vi.mock("@/lib/http", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe("permissionsApi.getMyPermissions", () => {
  it("calls expected endpoint", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      isAdmin: false,
      tree: [],
    });

    await permissionsApi.getMyPermissions();

    expect(apiClient.get).toHaveBeenCalledWith("/v1/profile/me");
  });
});
