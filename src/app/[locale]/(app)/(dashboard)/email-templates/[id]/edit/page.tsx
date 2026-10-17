import { TemplateEditContent } from "@/features/notifications/components/template-edit-content";
import { PermissionGate } from "@/components/molecules";
import { NotAuthorized } from "@/components/organisms";

export default async function EditNotificationTemplatePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  return (
    <PermissionGate adminOnly fallback={<NotAuthorized />}>
      <TemplateEditContent id={id} locale={locale} />
    </PermissionGate>
  );
}
