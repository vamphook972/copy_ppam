import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";

import { errorResponseInterceptor } from "./error.interceptor";

function createError(status: number, data?: unknown, hasAuthHeader = false): AxiosError {
  const headers = new AxiosHeaders();
  if (hasAuthHeader) {
    headers.set("Authorization", "Bearer mock-token");
  }

  return {
    isAxiosError: true,
    name: "AxiosError",
    message: "Request failed",
    config: {
      headers,
    } as InternalAxiosRequestConfig,
    response: {
      status,
      statusText: "Error",
      headers: {},
      config: {} as InternalAxiosRequestConfig,
      data,
    },
  } as AxiosError;
}

describe("errorResponseInterceptor", () => {
  it("extracts string details safely without calling .map", async () => {
    const error = createError(409, {
      error: {
        code: "CONFLICT",
        message: "Esta cuenta ya se encuentra activa.",
        details: "ACCOUNT_ALREADY_ACTIVE",
      },
    });

    await expect(errorResponseInterceptor(error as never)).rejects.toMatchObject({
      message: "Esta cuenta ya se encuentra activa.",
      code: "CONFLICT",
      status: 409,
      details: "ACCOUNT_ALREADY_ACTIVE",
    });
  });

  it("extracts array details and formats message", async () => {
    const error = createError(400, {
      error: {
        code: "BAD_REQUEST",
        message: "Validation failed",
        details: [{ field: "password", message: "Too short" }],
      },
    });

    await expect(errorResponseInterceptor(error as never)).rejects.toMatchObject({
      message: "Validation failed (password: Too short)",
      code: "BAD_REQUEST",
      status: 400,
      details: [{ field: "password", message: "Too short" }],
    });
  });

  it("handles 401 without auth header without attempting token refresh", async () => {
    const error = createError(
      401,
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Token expired",
          details: "TOKEN_EXPIRED",
        },
      },
      false
    );

    await expect(errorResponseInterceptor(error as never)).rejects.toMatchObject({
      message: "Token expired",
      code: "UNAUTHORIZED",
      status: 401,
      details: "TOKEN_EXPIRED",
    });
  });
});
