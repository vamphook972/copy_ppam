import { ZonesFormView, zonesModule } from "@/features/zones";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

interface ZoneEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function ZoneEditPage({ params }: ZoneEditPageProps) {
  const { id } = await params;

  return (
    <PermissionGate permission={zonesModule.permissions.update} fallback={<NotAuthorized />}>
      <ZonesFormView mode="edit" id={id} />
    </PermissionGate>
  );
}
