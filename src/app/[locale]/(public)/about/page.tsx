"use client";

import { Building2Icon, ShieldCheckIcon, Users2Icon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Typography } from "@/components/atoms";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <main className="container mx-auto space-y-12 px-4 py-8 md:px-6 md:py-12">
      {/* Header */}
      <header className="mx-auto max-w-3xl space-y-3 text-center">
        <Typography
          variant="h1"
          className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl"
        >
          {t("title")}
        </Typography>
        <Typography variant="subtitle" className="text-muted-foreground text-base leading-relaxed">
          {t("subhead")}
        </Typography>
      </header>

      {/* Main Mission Card */}
      <section className="mx-auto max-w-4xl">
        <Card className="border-border bg-card">
          <CardContent className="space-y-4 p-8">
            <Typography variant="h2" className="text-foreground text-xl font-bold">
              {t("philosophy.title")}
            </Typography>
            <Typography variant="body" className="text-muted-foreground text-sm leading-relaxed">
              {t("philosophy.description")}
            </Typography>
          </CardContent>
        </Card>
      </section>

      {/* Pillars Section */}
      <section className="mx-auto max-w-5xl space-y-6">
        <Typography variant="h2" className="text-foreground text-center text-xl font-bold">
          {t("pillars.title")}
        </Typography>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="border-border bg-card">
            <CardContent className="space-y-3 p-6">
              <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                <Building2Icon className="size-5" />
              </div>
              <Typography variant="h3" className="text-foreground text-base font-bold">
                {t("pillars.centralizedCoordination.title")}
              </Typography>
              <Typography
                variant="caption"
                className="text-muted-foreground text-xs leading-relaxed"
              >
                {t("pillars.centralizedCoordination.description")}
              </Typography>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="space-y-3 p-6">
              <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                <ShieldCheckIcon className="size-5" />
              </div>
              <Typography variant="h3" className="text-foreground text-base font-bold">
                {t("pillars.securityAndPrivacy.title")}
              </Typography>
              <Typography
                variant="caption"
                className="text-muted-foreground text-xs leading-relaxed"
              >
                {t("pillars.securityAndPrivacy.description")}
              </Typography>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="space-y-3 p-6">
              <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                <Users2Icon className="size-5" />
              </div>
              <Typography variant="h3" className="text-foreground text-base font-bold">
                {t("pillars.turnEfficiency.title")}
              </Typography>
              <Typography
                variant="caption"
                className="text-muted-foreground text-xs leading-relaxed"
              >
                {t("pillars.turnEfficiency.description")}
              </Typography>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
