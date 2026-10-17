import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useUrlState } from "@/hooks/use-url-state";

const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => "/test-path",
  useSearchParams: () => mockSearchParams,
}));

describe("useUrlState", () => {
  it("initializes state from defaults and URL search parameters", () => {
    mockSearchParams = new URLSearchParams("page=2&search=test");

    const { result } = renderHook(() =>
      useUrlState({
        page: 1,
        pageSize: 25,
        search: "",
      })
    );

    expect(result.current.state).toEqual({
      page: 2,
      pageSize: 25,
      search: "test",
    });
  });

  it("updates state and calls router.push with updated URL query params", () => {
    mockSearchParams = new URLSearchParams("page=1");

    const { result } = renderHook(() =>
      useUrlState({
        page: 1,
        pageSize: 25,
        search: "",
      })
    );

    act(() => {
      result.current.update({ page: 2, search: "new-search" });
    });

    expect(mockPush).toHaveBeenCalledWith("/test-path?page=2&search=new-search");
  });

  it("resets URL state to base pathname", () => {
    mockSearchParams = new URLSearchParams("page=3&search=foo");

    const { result } = renderHook(() =>
      useUrlState({
        page: 1,
        search: "",
      })
    );

    act(() => {
      result.current.reset();
    });

    expect(mockPush).toHaveBeenCalledWith("/test-path");
  });
});
