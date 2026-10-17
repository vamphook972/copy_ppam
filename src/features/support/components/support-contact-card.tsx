"use client";

import { MailIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Typography } from "@/components/atoms";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function SupportContactCard() {
  const t = useTranslations("support.contact");

  return (
    <Card className="border-border bg-card">
      <CardContent className="space-y-4 p-6">
        <Typography variant="h2" className="text-foreground text-lg font-bold">
          {t("title")}
        </Typography>

        <div className="flex items-start gap-3">
          <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
            <MailIcon className="size-5" aria-hidden="true" />
          </div>
          <div>
            <Typography variant="body" className="text-foreground text-sm font-semibold">
              {t("emailTitle")}
            </Typography>
            <Typography variant="body" className="text-primary text-sm font-medium">
              {t("email")}
            </Typography>
          </div>
        </div>

        <Typography variant="caption" className="text-muted-foreground text-xs leading-relaxed">
          {t("responseTime")}
        </Typography>

        <a
          href={`mailto:${t("email")}`}
          className={buttonVariants({ variant: "default", className: "w-full justify-center" })}
          aria-label={t("action")}
        >
          {t("action")}
        </a>
      </CardContent>
    </Card>
  );
}
