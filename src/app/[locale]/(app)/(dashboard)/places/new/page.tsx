import { PlacesFormView, placesModule } from "@/features/places";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

export default async function NewPlacePage() {
  return (
    <PermissionGate permission={placesModule.permissions.create} fallback={<NotAuthorized />}>
      <PlacesFormView mode="create" />
    </PermissionGate>
  );
}
