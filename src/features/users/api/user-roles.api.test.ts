import { describe, expect, it, vi } from "vitest";

import { apiClient } from "@/lib/http";

import { userRolesApi } from "./user-roles.api";

vi.mock("@/lib/http", () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

describe("userRolesApi", () => {
  const userId = "usr-123";

  it("getUserRoles calls GET /v1/users/:id/roles", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      userId,
      roles: ["KEY_MAN", "PARTICIPANT"],
    });

    const result = await userRolesApi.getUserRoles(userId);

    expect(apiClient.get).toHaveBeenCalledWith(`/v1/users/${userId}/roles`);
    expect(result.roles).toEqual(["KEY_MAN", "PARTICIPANT"]);
  });

  it("updateUserRoles calls PUT /v1/users/:id/roles with payload", async () => {
    vi.mocked(apiClient.put).mockResolvedValue({
      userId,
      roles: ["COORDINATOR"],
    });

    const result = await userRolesApi.updateUserRoles(userId, {
      roles: ["COORDINATOR"],
    });

    expect(apiClient.put).toHaveBeenCalledWith(`/v1/users/${userId}/roles`, {
      roles: ["COORDINATOR"],
    });
    expect(result.roles).toEqual(["COORDINATOR"]);
  });
});
