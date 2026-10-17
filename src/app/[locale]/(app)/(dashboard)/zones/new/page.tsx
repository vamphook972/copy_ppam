import { ZonesFormView, zonesModule } from "@/features/zones";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

export default async function NewZonePage() {
  return (
    <PermissionGate permission={zonesModule.permissions.create} fallback={<NotAuthorized />}>
      <ZonesFormView mode="create" />
    </PermissionGate>
  );
}
