import { describe, expect, it } from "vitest";

import { mapMenu } from "./menu.mapper";

describe("mapMenu", () => {
  it("maps dto node into ui menu node recursively", () => {
    const dto = {
      id: "home",
      label: "Inicio",
      route: "/es/home",
      icon: "home",
      permissions: ["dashboard:view"],
      children: [
        {
          id: "users",
          label: "Usuarios",
          route: "/es/users",
          icon: "users",
          permissions: ["users:view"],
          children: [],
        },
      ],
    };

    const mapped = mapMenu(dto);

    expect(mapped).toEqual({
      id: "home",
      title: "Inicio",
      href: "/es/home",
      icon: "home",
      permissions: ["dashboard:view"],
      children: [
        {
          id: "users",
          title: "Usuarios",
          href: "/es/users",
          icon: "users",
          permissions: ["users:view"],
          children: [],
        },
      ],
    });
  });

  it("handles node without children", () => {
    const dto = {
      id: "settings",
      label: "Configuración",
      route: "/es/settings",
      icon: "settings",
      permissions: [],
      children: [],
    };

    const mapped = mapMenu(dto);

    expect(mapped.children).toEqual([]);
    expect(mapped.title).toBe("Configuración");
    expect(mapped.href).toBe("/es/settings");
  });
});
