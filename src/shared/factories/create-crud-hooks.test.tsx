import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

import { createCrudHooks } from "@/shared/factories/create-crud-hooks";
import type { BaseEntity, CrudApiMethods } from "@/shared/types/crud-module.types";

interface TestEntity extends BaseEntity {
  id: string;
  name: string;
}

interface TestFormValues {
  name: string;
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  Wrapper.displayName = "TestWrapper";
  return Wrapper;
}

describe("createCrudHooks", () => {
  const mockApi: CrudApiMethods<TestEntity, TestFormValues> = {
    list: vi.fn().mockResolvedValue({
      items: [{ id: "1", name: "Test Entity" }],
      pagination: {
        page: 1,
        pageSize: 25,
        totalItems: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
        total: 1,
      },
    }),
    getById: vi.fn().mockResolvedValue({ id: "1", name: "Test Entity" }),
    create: vi.fn().mockResolvedValue({ id: "2", name: "New Entity" }),
    update: vi.fn().mockResolvedValue({ id: "1", name: "Updated Entity" }),
    remove: vi.fn().mockResolvedValue(undefined),
  };

  const hooks = createCrudHooks<TestEntity, TestFormValues>({
    entity: "test-entity",
    api: mockApi,
  });

  it("fetches list using useList hook", async () => {
    const { result } = renderHook(() => hooks.useList({ page: 1 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.list).toHaveBeenCalledWith({ page: 1 });
    expect(result.current.data?.items).toEqual([{ id: "1", name: "Test Entity" }]);
  });

  it("fetches entity detail using useDetail hook", async () => {
    const { result } = renderHook(() => hooks.useDetail("1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.getById).toHaveBeenCalledWith("1");
    expect(result.current.data).toEqual({ id: "1", name: "Test Entity" });
  });

  it("executes create mutation using useCreate hook", async () => {
    const { result } = renderHook(() => hooks.useCreate(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({ name: "New Entity" });

    expect(mockApi.create).toHaveBeenCalledWith({ name: "New Entity" });
  });
});
