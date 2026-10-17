"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { Typography } from "@/components/atoms";

import {
  notificationsApi,
  NotificationTemplate,
  notificationTemplateSchema,
  TemplateForm,
} from "../index";

interface TemplateCreateContentProps {
  locale: string;
}

export function TemplateCreateContent({ locale }: TemplateCreateContentProps) {
  const t = useTranslations("emailTemplates");
  const commonT = useTranslations("common");
  const router = useRouter();

  const handleSubmit = async (values: NotificationTemplate) => {
    const parsed = notificationTemplateSchema.safeParse(values);
    if (!parsed.success) {
      throw new Error("Datos de formulario inválidos");
    }
    await notificationsApi.createTemplate(parsed.data);
    router.push(`/${locale}/email-templates`);
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

      <TemplateForm
        mode="create"
        onSubmit={handleSubmit}
        submitLabel={t("form.submitCreate")}
        cancelLabel={commonT("cancel")}
        onCancel={() => router.push(`/${locale}/email-templates`)}
      />
    </main>
  );
}
