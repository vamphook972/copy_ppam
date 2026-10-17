import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

import { useRelationOptions } from "@/hooks/use-relation-options";
import { apiClient } from "@/lib/http";

vi.mock("@/lib/http", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  Wrapper.displayName = "TestWrapper";
  return Wrapper;
}

describe("useRelationOptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches relation options and maps them to ComboboxOption array", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: [
        { id: "city-1", name: "Cali" },
        { id: "city-2", name: "Bogotá" },
      ],
    });

    const { result } = renderHook(
      () =>
        useRelationOptions({
          endpoint: "/v1/cities",
          mapToOption: (item: unknown) => ({
            value: (item as { id: string; name: string }).id,
            label: (item as { id: string; name: string }).name,
          }),
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.options).toEqual([
      { value: "city-1", label: "Cali" },
      { value: "city-2", label: "Bogotá" },
    ]);
  });

  it("disables query when dependsOn field value is empty", async () => {
    const { result } = renderHook(
      () =>
        useRelationOptions(
          {
            endpoint: "/v1/zones",
            dependsOn: {
              field: "cityId",
              paramName: "cityId",
            },
            mapToOption: (item: unknown) => ({
              value: (item as { id: string; name: string }).id,
              label: (item as { id: string; name: string }).name,
            }),
          },
          "" // watchedValue is empty
        ),
      { wrapper: createWrapper() }
    );

    expect(result.current.options).toEqual([]);
    expect(apiClient.get).not.toHaveBeenCalled();
  });
});
