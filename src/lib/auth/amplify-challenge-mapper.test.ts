import { describe, expect, it, vi } from "vitest";

import {
  buildAnonymousSession,
  createSignInResult,
  mapChallengeType,
} from "./amplify-challenge-mapper";

describe("amplify-challenge-mapper", () => {
  describe("mapChallengeType", () => {
    it("maps known Cognito challenge steps correctly", () => {
      expect(mapChallengeType("CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED")).toBe(
        "NEW_PASSWORD_REQUIRED"
      );
      expect(mapChallengeType("CONFIRM_SIGN_IN_WITH_SMS_CODE")).toBe("SMS_MFA");
      expect(mapChallengeType("CONFIRM_SIGN_IN_WITH_TOTP_CODE")).toBe("SOFTWARE_TOKEN_MFA");
      expect(mapChallengeType("CONTINUE_SIGN_IN_WITH_MFA_SETUP_SELECTION")).toBe("MFA_SETUP");
      expect(mapChallengeType("CONTINUE_SIGN_IN_WITH_TOTP_SETUP")).toBe("MFA_SETUP");
      expect(mapChallengeType("DONE")).toBe("NONE");
      expect(mapChallengeType(undefined)).toBe("NONE");
      expect(mapChallengeType("UNKNOWN_STEP_XYZ")).toBe("UNKNOWN");
    });
  });

  describe("createSignInResult", () => {
    it("returns nextStep when challenge is required", async () => {
      const sessionLoader = vi.fn();
      const result = await createSignInResult("CONFIRM_SIGN_IN_WITH_SMS_CODE", sessionLoader);

      expect(result.session).toBeNull();
      expect(result.nextStep?.challenge).toBe("SMS_MFA");
      expect(sessionLoader).not.toHaveBeenCalled();
    });

    it("loads session when challenge is NONE", async () => {
      const mockSession = {
        user: { id: "1", email: "test@example.com" },
        isAuthenticated: true,
      };
      const sessionLoader = vi.fn().mockResolvedValue(mockSession);

      const result = await createSignInResult("DONE", sessionLoader);

      expect(result.session).toEqual(mockSession);
      expect(result.nextStep?.challenge).toBe("NONE");
      expect(sessionLoader).toHaveBeenCalledTimes(1);
    });
  });

  describe("buildAnonymousSession", () => {
    it("creates empty anonymous session", () => {
      const session = buildAnonymousSession();
      expect(session.user).toBeNull();
      expect(session.isAuthenticated).toBe(false);
    });
  });
});
