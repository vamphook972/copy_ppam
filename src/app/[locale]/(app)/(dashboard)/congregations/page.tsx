import { CongregationsListView, congregationsModule } from "@/features/congregations";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

interface CongregationsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CongregationsPage({ searchParams }: CongregationsPageProps) {
  const params = await searchParams;

  return (
    <PermissionGate permission={congregationsModule.permissions.read} fallback={<NotAuthorized />}>
      <CongregationsListView searchParams={params} />
    </PermissionGate>
  );
}
