"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { usePermission, useSession } from "@/providers";
import { Spinner, Typography } from "@/components/atoms";
import { AuthCard } from "@/components/templates/auth";
import { authClient } from "@/lib/auth";

const SESSION_ERROR_KEY = "session_refresh_failed";
const UNREGISTERED_USER_KEY = "unregistered_user";

export default function FederatedCallbackPage() {
  const t = useTranslations("auth.federated.callback");
  const locale = useLocale();
  const router = useRouter();
  const { refreshSession } = useSession();
  const { refreshPermissions } = usePermission();

  useEffect(() => {
    const run = async () => {
      try {
        const nextSession = await refreshSession();

        if (!nextSession?.isAuthenticated) {
          router.replace(`/${locale}/auth/error?message=${SESSION_ERROR_KEY}`);
          return;
        }

        try {
          const permState = await refreshPermissions(nextSession);
          if (!permState || !permState.user) {
            throw new Error("unregistered_user");
          }
        } catch {
          await authClient.signOut({ global: false }).catch(() => {});
          await fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
          router.replace(`/${locale}/auth/error?message=${UNREGISTERED_USER_KEY}`);
          return;
        }

        router.replace(`/${locale}/home`);
      } catch {
        router.replace(`/${locale}/auth/error?message=${SESSION_ERROR_KEY}`);
      }
    };

    void run();
  }, [locale, refreshPermissions, refreshSession, router]);

  return (
    <AuthCard title={t("title")} description="">
      <div className="flex items-center gap-3">
        <Spinner />
        <Typography variant="body" className="font-semibold">
          {t("loading")}
        </Typography>
      </div>
    </AuthCard>
  );
}
