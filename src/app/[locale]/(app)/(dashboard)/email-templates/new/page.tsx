import { TemplateCreateContent } from "@/features/notifications/components/template-create-content";
import { PermissionGate } from "@/components/molecules";
import { NotAuthorized } from "@/components/organisms";

export default async function NewNotificationTemplatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <PermissionGate adminOnly fallback={<NotAuthorized />}>
      <TemplateCreateContent locale={locale} />
    </PermissionGate>
  );
}
