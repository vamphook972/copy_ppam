import { PlacesDetailView, placesModule } from "@/features/places";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

interface PlaceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlaceDetailPage({ params }: PlaceDetailPageProps) {
  const { id } = await params;

  return (
    <PermissionGate permission={placesModule.permissions.read} fallback={<NotAuthorized />}>
      <PlacesDetailView id={id} />
    </PermissionGate>
  );
}
