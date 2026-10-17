import { AuthChallengeType, Session } from "@/types/auth";

import type { SignInResult } from "./auth-client";

export const mapChallengeType = (step?: string): AuthChallengeType => {
  switch (step) {
    case "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED":
      return "NEW_PASSWORD_REQUIRED";
    case "CONFIRM_SIGN_IN_WITH_SMS_CODE":
      return "SMS_MFA";
    case "CONFIRM_SIGN_IN_WITH_TOTP_CODE":
      return "SOFTWARE_TOKEN_MFA";
    case "CONTINUE_SIGN_IN_WITH_MFA_SETUP_SELECTION":
    case "CONTINUE_SIGN_IN_WITH_TOTP_SETUP":
      return "MFA_SETUP";
    case "DONE":
    case undefined:
      return "NONE";
    default:
      return "UNKNOWN";
  }
};

export const createSignInResult = async (
  step: string | undefined,
  sessionLoader: () => Promise<Session | null>
): Promise<SignInResult> => {
  const challengeType = mapChallengeType(step);

  if (challengeType !== "NONE") {
    return {
      session: null,
      nextStep: {
        challenge: challengeType,
        message:
          challengeType === "UNKNOWN"
            ? `Unsupported sign-in step: ${step ?? "unknown"}`
            : undefined,
      },
    };
  }

  return {
    session: await sessionLoader(),
    nextStep: { challenge: "NONE" },
  };
};

export const buildAnonymousSession = (): Session => ({
  user: null,
  isAuthenticated: false,
});
