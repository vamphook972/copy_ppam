import { TenantDetailContent } from "@/features/tenants";
import { PermissionGate } from "@/components/molecules";
import { NotAuthorized } from "@/components/organisms";

interface TenantDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TenantDetailPage({ params }: TenantDetailPageProps) {
  const { id } = await params;

  return (
    <PermissionGate adminOnly fallback={<NotAuthorized />}>
      <TenantDetailContent id={id} />
    </PermissionGate>
  );
}
