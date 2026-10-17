import { CircuitsDetailView, circuitsModule } from "@/features/circuits";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

interface CircuitDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CircuitDetailPage({ params }: CircuitDetailPageProps) {
  const { id } = await params;

  return (
    <PermissionGate permission={circuitsModule.permissions.read} fallback={<NotAuthorized />}>
      <CircuitsDetailView id={id} />
    </PermissionGate>
  );
}
