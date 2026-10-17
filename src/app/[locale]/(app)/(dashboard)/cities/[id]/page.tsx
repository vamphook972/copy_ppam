import { CitiesDetailView, citiesModule } from "@/features/cities";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

interface CityDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CityDetailPage({ params }: CityDetailPageProps) {
  const { id } = await params;

  return (
    <PermissionGate permission={citiesModule.permissions.read} fallback={<NotAuthorized />}>
      <CitiesDetailView id={id} />
    </PermissionGate>
  );
}
