import { PlacesListView, placesModule } from "@/features/places";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

interface PlacesPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PlacesPage({ searchParams }: PlacesPageProps) {
  const params = await searchParams;

  return (
    <PermissionGate permission={placesModule.permissions.read} fallback={<NotAuthorized />}>
      <PlacesListView searchParams={params} />
    </PermissionGate>
  );
}
