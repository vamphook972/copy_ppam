import type { ReactNode } from "react";
import { getLocale } from "next-intl/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AuthLayout } from "@/components/templates/auth";
import { authClient, parseSessionCookie, SESSION_COOKIE_NAME } from "@/lib/auth";

interface LayoutProps {
  children: ReactNode;
}

export default async function Layout({ children }: LayoutProps) {
  const locale = await getLocale();
  const cookieStore = await cookies();
  const sessionCookie = parseSessionCookie(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (sessionCookie?.isAuthenticated) {
    redirect(`/${locale}/home`);
  }

  const session = await authClient.getSession();
  if (session?.isAuthenticated) {
    redirect(`/${locale}/home`);
  }

  return <AuthLayout>{children}</AuthLayout>;
}
