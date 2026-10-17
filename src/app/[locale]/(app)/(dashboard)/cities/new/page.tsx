import { CitiesFormView, citiesModule } from "@/features/cities";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

export default async function NewCityPage() {
  return (
    <PermissionGate permission={citiesModule.permissions.create} fallback={<NotAuthorized />}>
      <CitiesFormView mode="create" />
    </PermissionGate>
  );
}
