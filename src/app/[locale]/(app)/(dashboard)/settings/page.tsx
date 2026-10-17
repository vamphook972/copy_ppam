import { getTranslations } from "next-intl/server";

import { TenantConfigPanel } from "@/features/tenants/components/tenant-config-panel";
import { Typography } from "@/components/atoms";

export default async function SettingsPage() {
  const t = await getTranslations("settings");

  return (
    <main className="space-y-8">
      {/* Page Header */}
      <header>
        <Typography variant="h1">{t("title")}</Typography>
        <Typography variant="subtitle">{t("subtitle")}</Typography>
      </header>

      {/* Panel Unificado de Configuración */}
      <TenantConfigPanel isNameDisabled={true} />
    </main>
  );
}
