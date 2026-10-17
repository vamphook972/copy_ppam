import { ZonesListView, zonesModule } from "@/features/zones";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

interface ZonesPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ZonesPage({ searchParams }: ZonesPageProps) {
  const params = await searchParams;

  return (
    <PermissionGate permission={zonesModule.permissions.read} fallback={<NotAuthorized />}>
      <ZonesListView searchParams={params} />
    </PermissionGate>
  );
}
