import { TenantCreateContent } from "@/features/tenants";
import { PermissionGate } from "@/components/molecules";
import { NotAuthorized } from "@/components/organisms";

export default async function NewTenantPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <PermissionGate adminOnly fallback={<NotAuthorized />}>
      <TenantCreateContent locale={locale} />
    </PermissionGate>
  );
}
