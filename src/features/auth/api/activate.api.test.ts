import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/lib/http";

import { activateUserSchema } from "../schemas/auth.schema";
import { activateApi } from "./activate.api";

vi.mock("@/lib/http", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
  isWrappedPayload: (payload: unknown) =>
    typeof payload === "object" && payload !== null && "data" in payload,
}));

describe("activateApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls GET /v1/auth/activate/verify with token", async () => {
    const mockData = {
      valid: true,
      email: "jhon97@gail.com",
      tenantId: "4678573f-44a3-427f-a5e5-888ebe9add6d",
      userId: "18aa9025-b1fb-4165-88d3-175a161949e6",
      name: "Jhon Doe",
    };

    vi.mocked(apiClient.get).mockResolvedValue({
      data: mockData,
    });

    const result = await activateApi.verifyActivationToken("token-abc");

    expect(apiClient.get).toHaveBeenCalledWith("/v1/auth/activate/verify", {
      params: { token: "token-abc" },
    });
    expect(result).toEqual(mockData);
  });

  it("calls POST /v1/auth/activate with payload", async () => {
    const payload = {
      token: "secret-token",
      password: "Password123",
    };

    vi.mocked(apiClient.post).mockResolvedValue({ success: true });

    const result = await activateApi.activateUser(payload);

    expect(apiClient.post).toHaveBeenCalledWith("/v1/auth/activate", payload);
    expect(result).toEqual({ success: true });
  });
});

describe("activateUserSchema", () => {
  it("validates a compliant payload", () => {
    const valid = {
      token: "valid-token",
      password: "Password123",
      confirmPassword: "Password123",
    };

    const parsed = activateUserSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it("fails when password and confirmPassword do not match", () => {
    const invalid = {
      token: "valid-token",
      password: "Password123",
      confirmPassword: "DifferentPassword123",
    };

    const parsed = activateUserSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toBe("passwordsDoNotMatch");
    }
  });

  it("fails when password does not meet complexity requirements", () => {
    const noUppercase = {
      token: "valid-token",
      password: "password123",
      confirmPassword: "password123",
    };
    expect(activateUserSchema.safeParse(noUppercase).success).toBe(false);

    const noNumber = {
      token: "valid-token",
      password: "PasswordXyz",
      confirmPassword: "PasswordXyz",
    };
    expect(activateUserSchema.safeParse(noNumber).success).toBe(false);

    const tooShort = {
      token: "valid-token",
      password: "Pass1",
      confirmPassword: "Pass1",
    };
    expect(activateUserSchema.safeParse(tooShort).success).toBe(false);
  });

  it("fails when token is empty", () => {
    const emptyToken = {
      token: "",
      password: "Password123",
      confirmPassword: "Password123",
    };
    expect(activateUserSchema.safeParse(emptyToken).success).toBe(false);
  });
});
