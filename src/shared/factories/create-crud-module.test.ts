import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import type { Permission } from "@/config/permissions";
import { createCrudModule } from "@/shared/factories/create-crud-module";
import type { BaseEntity } from "@/shared/types/crud-module.types";

vi.mock("@/config/env", () => ({
  env: {
    NEXT_PUBLIC_API_URL: "https://api.example.com",
    NEXT_PUBLIC_AWS_REGION: "us-east-1",
    NEXT_PUBLIC_USER_POOL_ID: "us-east-1_xxxxxx",
    NEXT_PUBLIC_USER_POOL_CLIENT_ID: "xxxxxxxxxxxx",
  },
}));

vi.mock("@/components/templates/crud/entity-list-page", () => ({
  EntityListPage: () => null,
}));
vi.mock("@/components/templates/crud/entity-form-page", () => ({
  EntityFormPage: () => null,
}));
vi.mock("@/components/templates/crud/entity-detail-page", () => ({
  EntityDetailPage: () => null,
}));

interface TestEntity extends BaseEntity {
  id: string;
  name: string;
}

interface TestDto {
  id: string;
  name: string;
}

interface TestFormValues {
  name: string;
}

describe("createCrudModule", () => {
  const mapDtoToEntity = (dto: TestDto): TestEntity => ({
    id: dto.id,
    name: dto.name,
  });

  const moduleResult = createCrudModule<TestEntity, TestDto, TestFormValues>({
    entity: "test-module",
    basePath: "/test-module",
    translationNamespace: "test-module",

    permissions: {
      read: "test:read" as Permission,
      create: "test:create" as Permission,
      update: "test:update" as Permission,
      delete: "test:delete" as Permission,
    },

    api: {
      endpoint: "/v1/test-module",
      mapDtoToEntity,
    },

    table: {
      columns: [
        {
          id: "name",
          header: "Name",
          cell: (row) => row.name,
        },
      ],
    },

    form: {
      schema: z.object({ name: z.string() }),
      defaultValues: { name: "" },
      fields: [
        {
          type: "text",
          name: "name",
          required: true,
        },
      ],
    },

    detail: {
      sections: [
        {
          title: "General",
          fields: [{ key: "name", label: "Name" }],
        },
      ],
    },

    actions: [
      { id: "view", type: "view", permission: "test:read" as Permission },
      { id: "edit", type: "edit", permission: "test:update" as Permission },
      { id: "delete", type: "delete", permission: "test:delete" as Permission },
    ],
  });

  it("exports configuration, api methods, hooks, and page components", () => {
    expect(moduleResult.config.entity).toBe("test-module");
    expect(moduleResult.config.basePath).toBe("/test-module");
    expect(moduleResult.config.translationNamespace).toBe("test-module");

    expect(typeof moduleResult.api.list).toBe("function");
    expect(typeof moduleResult.api.getById).toBe("function");
    expect(typeof moduleResult.api.create).toBe("function");
    expect(typeof moduleResult.api.update).toBe("function");
    expect(typeof moduleResult.api.remove).toBe("function");

    expect(typeof moduleResult.hooks.useList).toBe("function");
    expect(typeof moduleResult.hooks.useDetail).toBe("function");
    expect(typeof moduleResult.hooks.useCreate).toBe("function");
    expect(typeof moduleResult.hooks.useUpdate).toBe("function");
    expect(typeof moduleResult.hooks.useDelete).toBe("function");

    expect(typeof moduleResult.ListView).toBe("function");
    expect(typeof moduleResult.FormView).toBe("function");
    expect(typeof moduleResult.DetailView).toBe("function");
  });
});
