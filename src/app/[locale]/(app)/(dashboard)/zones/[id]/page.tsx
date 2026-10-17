import { ZonesDetailView, zonesModule } from "@/features/zones";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

interface ZoneDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ZoneDetailPage({ params }: ZoneDetailPageProps) {
  const { id } = await params;

  return (
    <PermissionGate permission={zonesModule.permissions.read} fallback={<NotAuthorized />}>
      <ZonesDetailView id={id} />
    </PermissionGate>
  );
}
