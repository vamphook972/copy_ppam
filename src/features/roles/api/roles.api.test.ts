import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/lib/http";

import { rolesApi } from "./roles.api";

vi.mock("@/lib/http", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe("rolesApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("listRoles fetches /v1/roles and sets categories", async () => {
    vi.mocked(apiClient.get).mockResolvedValue([
      { id: "role-1", name: "COORDINATOR", isSystem: true },
      { id: "role-2", name: "KEY_MAN", isSystem: false },
    ]);

    const result = await rolesApi.listRoles();

    expect(apiClient.get).toHaveBeenCalledWith("/v1/roles");
    expect(result).toHaveLength(2);
    expect(result[0].category).toBe("ADMINISTRATION");
    expect(result[1].category).toBe("OPERATIONS");
  });

  it("getUsersByRole fetches /v1/roles/:id/users with transformed params", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: [
        {
          id: "usr-1",
          email: "juan@example.com",
          firstName: "Juan",
          lastName: "Perez",
          phoneNumber: "+57123",
          roles: ["KEY_MAN"],
          status: "ACTIVE",
        },
      ],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
    });

    const result = await rolesApi.getUsersByRole("role-2", {
      page: 1,
      pageSize: 10,
    });

    expect(apiClient.get).toHaveBeenCalledWith(
      "/v1/roles/role-2/users",
      expect.objectContaining({
        params: expect.objectContaining({ page: 1, pageSize: 10 }),
      })
    );
    expect(result.items).toHaveLength(1);
    expect(result.items[0].email).toBe("juan@example.com");
    expect(result.pagination.total).toBe(1);
  });
});
