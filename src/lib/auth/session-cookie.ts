import { Session } from "@/types/auth";

export const SESSION_COOKIE_NAME = "appam_session";

export interface SessionCookiePayload {
  isAuthenticated: boolean;
  expiresAt?: number;
}

export const buildSessionCookiePayload = (session: Session | null): SessionCookiePayload | null => {
  if (!session?.isAuthenticated) {
    return null;
  }

  return {
    isAuthenticated: true,
    expiresAt: session.tokens?.expiresAt,
  };
};

export const parseSessionCookie = (cookieValue?: string): SessionCookiePayload | null => {
  if (!cookieValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(cookieValue) as SessionCookiePayload;

    if (!parsed?.isAuthenticated) {
      return null;
    }

    if (typeof parsed.expiresAt === "number" && parsed.expiresAt * 1000 <= Date.now()) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};
