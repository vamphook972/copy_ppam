import type { ReactNode } from "react";
import { getLocale } from "next-intl/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SessionExpiredCard } from "@/components/organisms";
import { DashboardLayout } from "@/components/templates/dashboard";
import { parseSessionCookie, SESSION_COOKIE_NAME } from "@/lib/auth";

interface LayoutProps {
  children: ReactNode;
}

export default async function Layout({ children }: LayoutProps) {
  const locale = await getLocale();
  const cookieStore = await cookies();
  const sessionCookie = parseSessionCookie(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  // Nunca confiar únicamente en la mera existencia de la cookie,
  // parseSessionCookie valida que la fecha de expiración (emitida por Cognito) siga vigente.
  // Evitamos consultas innecesarias a Cognito usando authClient en el servidor,
  // ya que Amplify no tiene acceso al localStorage aquí y siempre retornaría null.
  if (!sessionCookie?.isAuthenticated) {
    // Cognito indica que la sesión expiró.
    async function forceLogout() {
      "use server";
      const store = await cookies();
      store.delete(SESSION_COOKIE_NAME);
      redirect(`/${locale}/login`);
    }

    return <SessionExpiredCard action={forceLogout} />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
