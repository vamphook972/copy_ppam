import { CitiesFormView, citiesModule } from "@/features/cities";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

interface CityEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function CityEditPage({ params }: CityEditPageProps) {
  const { id } = await params;

  return (
    <PermissionGate permission={citiesModule.permissions.update} fallback={<NotAuthorized />}>
      <CitiesFormView mode="edit" id={id} />
    </PermissionGate>
  );
}
