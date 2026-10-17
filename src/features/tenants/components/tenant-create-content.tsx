"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { Typography } from "@/components/atoms";

import { CreateTenantRequest, createTenantSchema, TenantForm, tenantsApi } from "../index";

interface TenantCreateContentProps {
  locale: string;
}

export function TenantCreateContent({ locale }: TenantCreateContentProps) {
  const t = useTranslations("tenants");
  const commonT = useTranslations("common");
  const router = useRouter();

  const handleSubmit = async (values: CreateTenantRequest) => {
    const parsed = createTenantSchema.safeParse(values);
    if (!parsed.success) {
      throw new Error("Datos de formulario inválidos");
    }
    await tenantsApi.createTenant(parsed.data);
    router.push(`/${locale}/tenants`);
  };

  return (
    <main className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div x-data="{ pageName: 'Cities' }">
          <Typography variant="h1">{t("actions.createTitle")}</Typography>
          <Typography variant="body">{t("actions.createDescription")}</Typography>
        </div>
      </header>

      <div className="bg-card border-border rounded-lg border p-6 shadow-sm">
        <TenantForm
          mode="create"
          onSubmit={handleSubmit}
          submitLabel={t("form.submitCreate")}
          cancelLabel={commonT("cancel")}
          onCancel={() => router.push(`/${locale}/tenants`)}
        />
      </div>
    </main>
  );
}
