import { CircuitsListView, circuitsModule } from "@/features/circuits";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

interface CircuitsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CircuitsPage({ searchParams }: CircuitsPageProps) {
  const params = await searchParams;

  return (
    <PermissionGate permission={circuitsModule.permissions.read} fallback={<NotAuthorized />}>
      <CircuitsListView searchParams={params} />
    </PermissionGate>
  );
}
