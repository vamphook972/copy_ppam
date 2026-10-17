"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/atoms";
import { AuthFeedback } from "@/components/molecules";
import { AuthCard } from "@/components/templates/auth";

const errorKeyMap: Record<
  string,
  "sessionRefreshFailed" | "permissionRefreshFailed" | "unregisteredUser" | "unknownError"
> = {
  session_refresh_failed: "sessionRefreshFailed",
  permission_refresh_failed: "permissionRefreshFailed",
  unregistered_user: "unregisteredUser",
  unknown_error: "unknownError",
};

export default function FederatedErrorPage() {
  const t = useTranslations("auth.federated.error");
  const locale = useLocale();
  const searchParams = useSearchParams();

  const message = searchParams.get("message") ?? "unknown_error";
  const safeMessageKey = errorKeyMap[message] ?? "unknownError";

  return (
    <AuthCard title={t("title")} description="">
      <div className="mb-5">
        <AuthFeedback tone="error" message={t(safeMessageKey)} />
      </div>

      <Link href={`/${locale}/login`} className="block">
        <Button className="w-full">{t("backToLogin")}</Button>
      </Link>
    </AuthCard>
  );
}
