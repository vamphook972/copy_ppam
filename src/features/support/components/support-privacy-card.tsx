"use client";

import { useTranslations } from "next-intl";

import { Typography } from "@/components/atoms";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

export function SupportPrivacyCard() {
  const t = useTranslations("support.privacy");

  return (
    <Card className="border-border bg-card">
      <CardContent className="space-y-4 p-6">
        <Typography variant="h2" className="text-foreground text-lg font-bold">
          {t("title")}
        </Typography>

        <Typography variant="caption" className="text-muted-foreground text-xs leading-relaxed">
          {t("description")}
        </Typography>

        <div className="flex flex-col gap-2.5 pt-2">
          <Link
            href="/privacy-policy"
            className={buttonVariants({
              variant: "outline",
              className: "w-full justify-start text-xs font-medium",
            })}
            aria-label={t("privacyPolicy")}
          >
            {t("privacyPolicy")}
          </Link>

          <Link
            href="/terms-of-service"
            className={buttonVariants({
              variant: "outline",
              className: "w-full justify-start text-xs font-medium",
            })}
            aria-label={t("terms")}
          >
            {t("terms")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
