import { describe, expect, it } from "vitest";

import { Session } from "@/types/auth";

import { buildSessionCookiePayload, parseSessionCookie } from "./session-cookie";

describe("Session Cookie Almacenamiento y Manipulación", () => {
  it("builds and parses a valid session cookie payload", () => {
    const session: Session = {
      isAuthenticated: true,
      user: null,
      tokens: {
        accessToken: "access",
        idToken: "id",
        expiresAt: Math.floor(Date.now() / 1000) + 3600, // 1 hour in the future
      },
    };

    const payload = buildSessionCookiePayload(session);
    expect(payload).not.toBeNull();
    expect(payload?.isAuthenticated).toBe(true);

    const cookieString = JSON.stringify(payload);
    const parsed = parseSessionCookie(cookieString);
    expect(parsed).not.toBeNull();
    expect(parsed?.isAuthenticated).toBe(true);
  });

  it("fails to parse an expired session cookie (sesión vencida)", () => {
    const expiredPayload = {
      isAuthenticated: true,
      expiresAt: Math.floor(Date.now() / 1000) - 10, // 10 seconds ago
    };

    const parsed = parseSessionCookie(JSON.stringify(expiredPayload));
    expect(parsed).toBeNull();
  });

  it("fails to parse a manipulated cookie (debe fallar)", () => {
    // Attempt 1: Malformed JSON
    const malformed = parseSessionCookie("invalid-json");
    expect(malformed).toBeNull();

    // If expiresAt is missing, parseSessionCookie might allow it if it doesn't check it,
    // but in session-cookie.ts it checks: if (parsed.expiresAt && parsed.expiresAt * 1000 <= Date.now())
    // Let's verify what happens if expiresAt is in the past.
    const manipulatedExpired = {
      isAuthenticated: true,
      expiresAt: 0,
    };
    const parsedManipulated = parseSessionCookie(JSON.stringify(manipulatedExpired));
    expect(parsedManipulated).toBeNull();
  });
});
