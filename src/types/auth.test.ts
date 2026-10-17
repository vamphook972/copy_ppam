import { describe, expect, it } from "vitest";

import { Session } from "@/types/auth";

describe("Auth type contracts", () => {
  it("should allow a fully authenticated session shape", () => {
    const session: Session = {
      user: {
        id: "u_1",
        email: "john@doe.com",
        firstName: "John",
        lastName: "Doe",
        fullName: "John Doe",
      },
      tokens: {
        accessToken: "access-token",
        idToken: "id-token",
        refreshToken: "refresh-token",
        expiresAt: Date.now() + 60_000,
      },
      flow: "credentials",
      challenge: {
        type: "NONE",
      },
      isAuthenticated: true,
    };

    expect(session.isAuthenticated).toBe(true);
    expect(session.tokens?.accessToken).toBeTruthy();
  });

  it("should allow anonymous session fallback shape", () => {
    const session: Session = {
      user: null,
      isAuthenticated: false,
    };

    expect(session.isAuthenticated).toBe(false);
    expect(session.user).toBeNull();
  });
});
