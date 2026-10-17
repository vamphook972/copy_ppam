import { CircuitsFormView, circuitsModule } from "@/features/circuits";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

interface CircuitEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function CircuitEditPage({ params }: CircuitEditPageProps) {
  const { id } = await params;

  return (
    <PermissionGate permission={circuitsModule.permissions.update!} fallback={<NotAuthorized />}>
      <CircuitsFormView mode="edit" id={id} />
    </PermissionGate>
  );
}
