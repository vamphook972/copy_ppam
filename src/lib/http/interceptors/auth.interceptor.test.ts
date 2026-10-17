import type { InternalAxiosRequestConfig } from "axios";
import { AxiosHeaders } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { authClient } from "@/lib/auth";
import { Session } from "@/types/auth";

import { authRequestInterceptor } from "./auth.interceptor";

vi.mock("@/lib/auth", () => ({
  authClient: {
    getSession: vi.fn(),
  },
}));

function createConfig(url: string): InternalAxiosRequestConfig {
  return {
    url,
    method: "get",
    headers: new AxiosHeaders(),
  } as InternalAxiosRequestConfig;
}

describe("authRequestInterceptor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("adds Authorization header for protected endpoints when accessToken exists", async () => {
    vi.mocked(authClient.getSession).mockResolvedValue({
      user: null,
      permissions: [],
      menu: [],
      isAdmin: false,
      isAuthenticated: true,
      tokens: {
        accessToken: "access-token",
        idToken: "id-token",
      },
    } as Session);

    const config = createConfig("/v1/users");

    const result = await authRequestInterceptor(config);

    expect(result.headers.get("Authorization")).toBe("Bearer access-token");
  });

  it("does not add Authorization header for public endpoints", async () => {
    vi.mocked(authClient.getSession).mockResolvedValue({
      user: null,
      permissions: [],
      menu: [],
      isAdmin: false,
      isAuthenticated: true,
      tokens: {
        accessToken: "access-token",
        idToken: "id-token",
      },
    } as Session);

    const config = createConfig("/v1/users/register");

    const result = await authRequestInterceptor(config);

    expect(result.headers.get("Authorization")).toBeUndefined();
  });

  it("does not add Authorization header for /v1/auth/activate", async () => {
    vi.mocked(authClient.getSession).mockResolvedValue({
      user: null,
      permissions: [],
      menu: [],
      isAdmin: false,
      isAuthenticated: true,
      tokens: {
        accessToken: "access-token",
        idToken: "id-token",
      },
    } as Session);

    const config = createConfig("/v1/auth/activate");

    const result = await authRequestInterceptor(config);

    expect(result.headers.get("Authorization")).toBeUndefined();
  });

  it("does not add Authorization header for /v1/auth/activate/verify", async () => {
    vi.mocked(authClient.getSession).mockResolvedValue({
      user: null,
      permissions: [],
      menu: [],
      isAdmin: false,
      isAuthenticated: true,
      tokens: {
        accessToken: "access-token",
        idToken: "id-token",
      },
    } as Session);

    const config = createConfig("/v1/auth/activate/verify?token=xyz");

    const result = await authRequestInterceptor(config);

    expect(result.headers.get("Authorization")).toBeUndefined();
  });

  it("does not add Authorization header when session has no idToken", async () => {
    vi.mocked(authClient.getSession).mockResolvedValue({
      user: null,
      permissions: [],
      menu: [],
      isAdmin: false,
      isAuthenticated: true,
    } as Session);

    const config = createConfig("/v1/users");

    const result = await authRequestInterceptor(config);

    expect(result.headers.get("Authorization")).toBeUndefined();
  });
});
