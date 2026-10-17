import { LifeBuoyIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import {
  SupportChecklistSection,
  SupportContactCard,
  SupportFaqSection,
  SupportPrivacyCard,
} from "@/features/support";
import { Typography } from "@/components/atoms";

export default async function SupportPage() {
  const t = await getTranslations("support");

  return (
    <main className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Columna Izquierda (~30% / 4 columnas en lg) */}
        <aside className="space-y-6 lg:col-span-4">
          <SupportContactCard />
          <SupportPrivacyCard />
        </aside>

        {/* Columna Derecha (~70% / 8 columnas en lg) */}
        <div className="space-y-10 lg:col-span-8">
          {/* Header */}
          <header className="flex flex-col items-center text-center">
            <div className="bg-primary/10 text-primary mb-4 flex size-16 items-center justify-center rounded-full">
              <LifeBuoyIcon className="size-8" aria-hidden="true" />
            </div>
            <Typography
              variant="h1"
              className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl"
            >
              {t("title")}
            </Typography>
            <Typography
              variant="subtitle"
              className="text-muted-foreground mt-2 text-center text-sm font-normal"
            >
              {t("subtitle")}
            </Typography>
          </header>

          {/* Sección FAQ */}
          <SupportFaqSection />

          {/* Sección Antes de Contactar */}
          <SupportChecklistSection />
        </div>
      </div>
    </main>
  );
}
