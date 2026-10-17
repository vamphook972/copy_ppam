import { describe, expect, it } from "vitest";

import { mapPermissions } from "@/features/auth/mappers/permission.mapper";

describe("mapPermissions", () => {
  it("maps menu and flattens unique permissions from tree", () => {
    const result = mapPermissions({
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
            route: "/home",
            icon: "Home",
            permissions: ["dashboard:view"],
            children: [
              {
                id: "users",
                label: "Usuarios",
                route: "/users",
                icon: "Users",
                permissions: ["users:view", "users:create"],
                children: [],
              },
            ],
          },
          {
            id: "reports",
            label: "Reportes",
            route: "/reports",
            icon: "BarChart3",
            permissions: ["dashboard:view", "reports:view"],
            children: [],
          },
        ],
      },
    });

    expect(result.isAdmin).toBe(false);
    expect(result.menu).toHaveLength(2);
    expect(result.permissions).toEqual(
      expect.arrayContaining(["dashboard:view", "users:view", "users:create", "reports:view"])
    );
    expect(result.permissions).toHaveLength(4);
    expect(result.user?.roles).toEqual([]);
  });

  it("returns empty permissions for empty tree", () => {
    const result = mapPermissions({
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
        isAdmin: true,
        tree: [],
      },
    });

    expect(result.isAdmin).toBe(true);
    expect(result.menu).toEqual([]);
    expect(result.permissions).toEqual([]);
    expect(result.user?.roles).toEqual(["ADMIN"]);
  });
});
