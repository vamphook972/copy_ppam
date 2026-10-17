"use client";

import { CheckCircle2Icon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Typography } from "@/components/atoms";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function SignUpSuccessCard() {
  const t = useTranslations("register.success");

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-6 text-center">
      <div className="bg-success/10 text-success flex size-16 items-center justify-center rounded-full">
        <CheckCircle2Icon className="size-10" />
      </div>

      <div className="space-y-2">
        <Typography variant="h2" className="text-foreground text-2xl font-extrabold tracking-tight">
          {t("title")}
        </Typography>
        <Typography variant="subtitle" className="text-muted-foreground mx-auto max-w-sm text-sm">
          {t("description")}
        </Typography>
      </div>

      <Link
        href="/login"
        className={buttonVariants({ variant: "default", size: "lg", className: "w-full" })}
      >
        {t("loginButton")}
      </Link>
    </div>
  );
}
