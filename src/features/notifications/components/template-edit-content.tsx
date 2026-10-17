"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { Typography } from "@/components/atoms";
import { LoadingState } from "@/components/molecules";

import {
  notificationsApi,
  NotificationTemplate,
  notificationTemplateSchema,
  TemplateForm,
} from "../index";

interface TemplateEditContentProps {
  id: string;
  locale: string;
}

export function TemplateEditContent({ id, locale }: TemplateEditContentProps) {
  const t = useTranslations("emailTemplates");
  const commonT = useTranslations("common");
  const router = useRouter();

  // Query to get list of templates to find the target template by ID
  const templatesQuery = useQuery({
    queryKey: ["notification-templates", "edit", id],
    queryFn: () => notificationsApi.getTemplates({ search: id }),
  });

  const template =
    templatesQuery.data?.items?.find((t) => t.templateId === id) || templatesQuery.data?.items?.[0];

  const handleSubmit = async (values: NotificationTemplate) => {
    const parsed = notificationTemplateSchema.safeParse(values);
    if (!parsed.success) {
      throw new Error("Datos de formulario inválidos");
    }
    // Update call to notification template API
    await notificationsApi.createTemplate(parsed.data);
    router.push(`/${locale}/email-templates`);
  };

  if (templatesQuery.isPending) {
    return (
      <main className="space-y-6">
        <LoadingState title={t("states.loading")} />
      </main>
    );
  }

  return (
    <main className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div x-data="{ pageName: 'Cities' }">
          <Typography variant="h1">{t("actions.editTitle")}</Typography>
          <Typography variant="body">{t("actions.editDescription")}</Typography>
        </div>
      </header>

      <TemplateForm
        mode="edit"
        initialValues={
          template || {
            templateId: id,
            subject: "",
            body: "",
            language: "es",
            description: "",
            variables: [],
          }
        }
        onSubmit={handleSubmit}
        submitLabel={t("form.submitUpdate")}
        cancelLabel={commonT("cancel")}
        onCancel={() => router.push(`/${locale}/email-templates`)}
      />
    </main>
  );
}
