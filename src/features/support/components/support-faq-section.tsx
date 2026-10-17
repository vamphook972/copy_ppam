"use client";

import { AlertTriangleIcon, BugIcon, LogInIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Typography } from "@/components/atoms";
import { Card, CardContent } from "@/components/ui/card";

export function SupportFaqSection() {
  const t = useTranslations("support.faq");

  const faqs = [
    {
      id: "login",
      icon: LogInIcon,
      title: t("login.title"),
      description: t("login.description"),
      fullWidth: false,
    },
    {
      id: "appIssue",
      icon: AlertTriangleIcon,
      title: t("appIssue.title"),
      description: t("appIssue.description"),
      fullWidth: false,
    },
    {
      id: "reportBug",
      icon: BugIcon,
      title: t("reportBug.title"),
      description: t("reportBug.description"),
      fullWidth: true,
    },
  ];

  return (
    <section className="space-y-4" aria-labelledby="faq-heading">
      <Typography id="faq-heading" variant="h2" className="text-foreground text-xl font-bold">
        {t("title")}
      </Typography>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {faqs.map((faq) => {
          const IconComponent = faq.icon;
          return (
            <Card
              key={faq.id}
              className={`border-border bg-card transition-all hover:shadow-md ${
                faq.fullWidth ? "md:col-span-2" : ""
              }`}
            >
              <CardContent className="flex items-start gap-4 p-5">
                <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <IconComponent className="size-5" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <Typography variant="h3" className="text-foreground text-base font-semibold">
                    {faq.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    className="text-muted-foreground text-xs leading-relaxed"
                  >
                    {faq.description}
                  </Typography>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
