import { ReactNode } from "react";
import { cookies } from "next/headers";

import { AppProvider } from "@/providers";
import { parseSessionCookie, SESSION_COOKIE_NAME } from "@/lib/auth";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const sessionCookie = parseSessionCookie(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  const initialSession = sessionCookie?.isAuthenticated
    ? {
        isAuthenticated: true,
        user: null,
        tokens: { expiresAt: sessionCookie.expiresAt, accessToken: "", idToken: "" },
      }
    : null;

  return <AppProvider initialSession={initialSession}>{children}</AppProvider>;
}
