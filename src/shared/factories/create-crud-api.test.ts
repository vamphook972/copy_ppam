import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/lib/http";
import { createCrudApi } from "@/shared/factories/create-crud-api";
import type { BaseEntity } from "@/shared/types/crud-module.types";

vi.mock("@/lib/http", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
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

describe("createCrudApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mapDtoToEntity = (dto: TestDto): TestEntity => ({
    id: dto.id,
    name: dto.name,
  });

  const api = createCrudApi<TestEntity, TestDto, TestFormValues>({
    endpoint: "/v1/test-items",
    mapDtoToEntity,
  });

  it("calls list endpoint and extracts items and pagination", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: [{ id: "1", name: "Item 1" }],
      meta: {
        pagination: {
          page: 1,
          pageSize: 25,
          totalItems: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      },
    });

    const result = await api.list({ page: 1, pageSize: 25 });

    expect(apiClient.get).toHaveBeenCalledWith("/v1/test-items", {
      params: {
        page: 1,
        "page[number]": 1,
        pageSize: 25,
        "page[size]": 25,
      },
    });
    expect(result.items).toEqual([{ id: "1", name: "Item 1" }]);
    expect(result.pagination.totalItems).toBe(1);
    expect(result.pagination.totalPages).toBe(1);
  });

  it("merges defaultParams into list query when specified in config", async () => {
    const apiWithDefaults = createCrudApi<TestEntity, TestDto, TestFormValues>({
      endpoint: "/v1/test-items",
      defaultParams: { include: "city,zone" as unknown as string },
      mapDtoToEntity,
    });

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: [{ id: "1", name: "Item 1" }],
    });

    await apiWithDefaults.list({ page: 1 });

    expect(apiClient.get).toHaveBeenCalledWith("/v1/test-items", {
      params: {
        include: "city,zone",
        page: 1,
        "page[number]": 1,
      },
    });
  });

  it("calls getById endpoint", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { id: "123", name: "Item 123" },
    });

    const result = await api.getById("123");

    expect(apiClient.get).toHaveBeenCalledWith("/v1/test-items/123", { params: undefined });
    expect(result).toEqual({ id: "123", name: "Item 123" });
  });

  it("calls create endpoint with form values", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { id: "456", name: "New Item" },
    });

    const result = await api.create({ name: "New Item" });

    expect(apiClient.post).toHaveBeenCalledWith("/v1/test-items", { name: "New Item" });
    expect(result).toEqual({ id: "456", name: "New Item" });
  });

  it("calls update endpoint", async () => {
    vi.mocked(apiClient.put).mockResolvedValueOnce({
      data: { id: "456", name: "Updated Item" },
    });

    const result = await api.update("456", { name: "Updated Item" });

    expect(apiClient.put).toHaveBeenCalledWith("/v1/test-items/456", { name: "Updated Item" });
    expect(result).toEqual({ id: "456", name: "Updated Item" });
  });

  it("calls remove endpoint", async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce(undefined);

    await api.remove("789");

    expect(apiClient.delete).toHaveBeenCalledWith("/v1/test-items/789");
  });

  it("uses custom list override if provided in config", async () => {
    const customList = vi.fn().mockResolvedValueOnce({
      items: [{ id: "c1", name: "Custom" }],
      pagination: {
        page: 1,
        pageSize: 10,
        totalItems: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
        total: 1,
      },
    });

    const customApi = createCrudApi<TestEntity, TestDto, TestFormValues>({
      endpoint: "/v1/test-items",
      mapDtoToEntity,
      list: customList,
    });

    const result = await customApi.list({ page: 1 });
    expect(customList).toHaveBeenCalledWith({ page: 1 });
    expect(result.items).toEqual([{ id: "c1", name: "Custom" }]);
  });
});
