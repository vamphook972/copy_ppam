"use client";

import { AppWindowIcon, FileTextIcon, ImageIcon, LaptopIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Typography } from "@/components/atoms";
import { Card, CardContent } from "@/components/ui/card";

export function SupportChecklistSection() {
  const t = useTranslations("support.beforeContact");

  const checklistItems = [
    {
      id: "deviceInfo",
      icon: LaptopIcon,
      title: t("deviceInfo.title"),
      description: t("deviceInfo.description"),
    },
    {
      id: "appInfo",
      icon: AppWindowIcon,
      title: t("appInfo.title"),
      description: t("appInfo.description"),
    },
    {
      id: "describeProblem",
      icon: FileTextIcon,
      title: t("describeProblem.title"),
      description: t("describeProblem.description"),
    },
    {
      id: "screenshots",
      icon: ImageIcon,
      title: t("screenshots.title"),
      description: t("screenshots.description"),
    },
  ];

  return (
    <section className="space-y-4" aria-labelledby="before-contact-heading">
      <Typography
        id="before-contact-heading"
        variant="h2"
        className="text-foreground text-xl font-bold"
      >
        {t("title")}
      </Typography>

      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {checklistItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <div key={item.id} className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                    <IconComponent className="size-5" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <Typography variant="h3" className="text-foreground text-base font-semibold">
                      {item.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      className="text-muted-foreground text-xs leading-relaxed"
                    >
                      {item.description}
                    </Typography>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
