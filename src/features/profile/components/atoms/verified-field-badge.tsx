"use client";

import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";

interface VerifiedFieldBadgeProps {
  className?: string;
}

export function VerifiedFieldBadge({ className }: VerifiedFieldBadgeProps) {
  const t = useTranslations("profile.personal");

  return (
    <span
      className={`bg-muted text-muted-foreground inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium ${className ?? ""}`}
      title={t("verifiedField")}
    >
      <Lock className="text-muted-foreground/70 h-3 w-3" aria-hidden="true" />
      <span>{t("verifiedField")}</span>
    </span>
  );
}
