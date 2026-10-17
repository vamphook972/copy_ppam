import { PlacesFormView, placesModule } from "@/features/places";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

interface PlaceEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlaceEditPage({ params }: PlaceEditPageProps) {
  const { id } = await params;

  return (
    <PermissionGate permission={placesModule.permissions.update} fallback={<NotAuthorized />}>
      <PlacesFormView mode="edit" id={id} />
    </PermissionGate>
  );
}
