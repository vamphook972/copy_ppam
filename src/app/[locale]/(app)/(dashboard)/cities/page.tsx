import { CitiesListView, citiesModule } from "@/features/cities";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

interface CitiesPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CitiesPage({ searchParams }: CitiesPageProps) {
  const params = await searchParams;

  return (
    <PermissionGate permission={citiesModule.permissions.read} fallback={<NotAuthorized />}>
      <CitiesListView searchParams={params} />
    </PermissionGate>
  );
}
