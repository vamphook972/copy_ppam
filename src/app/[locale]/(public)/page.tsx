"use client";

import {
  ArrowRightIcon,
  CalendarCheckIcon,
  MapPinIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Typography } from "@/components/atoms";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

export default function LandingPage() {
  const t = useTranslations("landing");

  return (
    <div className="space-y-16 py-8 md:py-16">
      {/* Hero Section */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="mx-auto flex max-w-4xl flex-col items-center space-y-6 text-center">
          <div className="bg-primary/10 text-primary border-primary/20 inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold">
            <ShieldCheckIcon className="size-3.5" />
            <span>{t("badge")}</span>
          </div>

          <Typography
            variant="h1"
            className="text-foreground text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
          >
            {t("heroTitle")}
          </Typography>

          <Typography
            variant="subtitle"
            className="text-muted-foreground max-w-2xl text-base sm:text-lg"
          >
            {t("heroSubtitle")}
          </Typography>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/login"
              className={buttonVariants({ variant: "default", size: "lg", className: "gap-2" })}
            >
              <span>{t("actions.login")}</span>
              <ArrowRightIcon className="size-4" />
            </Link>

            <Link href="/support" className={buttonVariants({ variant: "outline", size: "lg" })}>
              {t("actions.support")}
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="space-y-8">
          <div className="space-y-2 text-center">
            <Typography variant="h2" className="text-foreground text-2xl font-bold sm:text-3xl">
              {t("features.title")}
            </Typography>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-border bg-card">
              <CardContent className="space-y-3 p-6">
                <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-xl">
                  <MapPinIcon className="size-6" />
                </div>
                <Typography variant="h3" className="text-foreground text-lg font-bold">
                  {t("features.places.title")}
                </Typography>
                <Typography
                  variant="caption"
                  className="text-muted-foreground text-xs leading-relaxed"
                >
                  {t("features.places.description")}
                </Typography>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="space-y-3 p-6">
                <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-xl">
                  <CalendarCheckIcon className="size-6" />
                </div>
                <Typography variant="h3" className="text-foreground text-lg font-bold">
                  {t("features.scheduling.title")}
                </Typography>
                <Typography
                  variant="caption"
                  className="text-muted-foreground text-xs leading-relaxed"
                >
                  {t("features.scheduling.description")}
                </Typography>
              </CardContent>
            </Card>

            <Card className="border-border bg-card sm:col-span-2 lg:col-span-1">
              <CardContent className="space-y-3 p-6">
                <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-xl">
                  <UsersIcon className="size-6" />
                </div>
                <Typography variant="h3" className="text-foreground text-lg font-bold">
                  {t("features.volunteers.title")}
                </Typography>
                <Typography
                  variant="caption"
                  className="text-muted-foreground text-xs leading-relaxed"
                >
                  {t("features.volunteers.description")}
                </Typography>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Support CTA Banner */}
      <section className="container mx-auto px-4 md:px-6">
        <Card className="border-primary/20 bg-accent/40 overflow-hidden">
          <CardContent className="flex flex-col items-center justify-between gap-6 p-8 text-center sm:flex-row sm:text-left">
            <div className="space-y-2">
              <Typography variant="h2" className="text-foreground text-xl font-bold">
                {t("supportBanner.title")}
              </Typography>
              <Typography variant="subtitle" className="text-muted-foreground text-xs">
                {t("supportBanner.subtitle")}
              </Typography>
            </div>
            <Link
              href="/support"
              className={buttonVariants({ variant: "default", className: "shrink-0" })}
            >
              {t("supportBanner.button")}
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
