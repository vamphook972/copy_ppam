"use client";

import { useTranslations } from "next-intl";

import { Typography } from "@/components/atoms";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  const t = useTranslations("privacy");

  return (
    <main className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-2 text-center sm:text-left">
          <Typography
            variant="h1"
            className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl"
          >
            {t("title")}
          </Typography>
          <Typography variant="subtitle" className="text-muted-foreground text-sm">
            {t("subtitle")}
          </Typography>
          <Typography
            variant="caption"
            className="text-muted-foreground block text-xs font-semibold"
          >
            {t("lastUpdated")}
          </Typography>
        </header>

        <Card className="border-border bg-card">
          <CardContent className="space-y-8 p-6 md:p-8">
            <section className="space-y-2">
              <Typography variant="h2" className="text-foreground text-lg font-bold">
                {t("sections.collection.title")}
              </Typography>
              <Typography variant="body" className="text-muted-foreground text-sm leading-relaxed">
                {t("sections.collection.content")}
              </Typography>
            </section>

            <section className="space-y-2">
              <Typography variant="h2" className="text-foreground text-lg font-bold">
                {t("sections.use.title")}
              </Typography>
              <Typography variant="body" className="text-muted-foreground text-sm leading-relaxed">
                {t("sections.use.content")}
              </Typography>
            </section>

            <section className="space-y-2">
              <Typography variant="h2" className="text-foreground text-lg font-bold">
                {t("sections.security.title")}
              </Typography>
              <Typography variant="body" className="text-muted-foreground text-sm leading-relaxed">
                {t("sections.security.content")}
              </Typography>
            </section>

            <section className="space-y-2">
              <Typography variant="h2" className="text-foreground text-lg font-bold">
                {t("sections.retention.title")}
              </Typography>
              <Typography variant="body" className="text-muted-foreground text-sm leading-relaxed">
                {t("sections.retention.content")}
              </Typography>
            </section>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
