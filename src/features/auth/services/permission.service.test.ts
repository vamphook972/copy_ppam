import { describe, expect, it, vi } from "vitest";

import { permissionsApi } from "@/features/auth/api/permissions.api";
import { permissionService } from "@/features/auth/services/permission.service";

vi.mock("@/features/auth/api/permissions.api", () => ({
  permissionsApi: {
    getMyPermissions: vi.fn(),
  },
}));

describe("permissionService.getMyPermissions", () => {
  it("maps dto response to permission state", async () => {
    vi.mocked(permissionsApi.getMyPermissions).mockResolvedValue({
      tenant: { id: "t1", name: "Tenant Test" },
      user: {
        id: "u1",
        firstName: "Carlos",
        lastName: "Pérez",
        preferredName: "Charlie",
        email: "carlos@test.com",
        gender: "MALE",
        birthDate: null,
        baptismDate: null,
        status: {
          code: "ACTIVE",
          name: "Activo",
        },
      },
      profile: {
        phones: { primary: { countryCode: "+57", number: "3001234567" } },
        congregationId: null,
        languages: [],
        relationships: [],
        availability: [],
      },
      session: {
        isAdmin: false,
        tree: [
          {
            id: "home",
            label: "Inicio",
            icon: "Home",
            route: "/home",
            permissions: ["dashboard:view"],
            children: [],
          },
        ],
      },
    });

    const result = await permissionService.getMyPermissions();

    expect(result.isAdmin).toBe(false);
    expect(result.permissions).toEqual(["dashboard:view"]);
    expect(result.menu).toHaveLength(1);
  });
});
