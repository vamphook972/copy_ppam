import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

import { Session } from "@/types/auth";
import { User } from "@/types/user";

export interface SessionResolver {
  resolveSession(options?: { forceRefresh?: boolean }): Promise<Session | null>;
}

export class AmplifySessionResolver implements SessionResolver {
  async resolveSession(options?: { forceRefresh?: boolean }): Promise<Session | null> {
    try {
      const authSession = await fetchAuthSession(options);

      const accessToken = authSession.tokens?.accessToken?.toString();
      const idToken = authSession.tokens?.idToken?.toString();
      const expiresAt = authSession.tokens?.accessToken?.payload?.exp;

      if (!accessToken || !idToken) {
        return null;
      }

      const user = await this.extractUser(authSession);

      return {
        user,
        tokens: {
          accessToken,
          idToken,
          expiresAt,
        },
        flow: "credentials",
        challenge: { type: "NONE" },
        isAuthenticated: true,
      };
    } catch {
      return null;
    }
  }

  private async extractUser(
    authSession: Awaited<ReturnType<typeof fetchAuthSession>>
  ): Promise<User> {
    let userId = "";
    let email = "";
    let fullName = "";

    try {
      const currentUser = await getCurrentUser();
      const username = currentUser.username ?? "";
      const loginId = currentUser.signInDetails?.loginId ?? "";

      userId = currentUser.userId ?? "";
      email = username || loginId;
      fullName = loginId || username;
    } catch {
      const accessPayload = authSession.tokens?.accessToken?.payload;
      const idPayload = authSession.tokens?.idToken?.payload;

      userId =
        String(
          idPayload?.sub ??
            accessPayload?.sub ??
            idPayload?.username ??
            accessPayload?.username ??
            ""
        ) || "";
      email =
        String(
          idPayload?.email ??
            accessPayload?.email ??
            idPayload?.username ??
            accessPayload?.username ??
            ""
        ) || "";
      fullName =
        String(
          idPayload?.name ??
            accessPayload?.name ??
            idPayload?.preferred_username ??
            accessPayload?.preferred_username ??
            email
        ) || "";
    }

    const parts = fullName.trim().split(" ").filter(Boolean);
    const firstName = parts[0] ?? "";
    const lastName = parts.slice(1).join(" ");

    return {
      id: userId,
      email,
      firstName,
      lastName,
      fullName: fullName || email,
    };
  }
}
