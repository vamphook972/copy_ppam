import { CircuitsFormView, circuitsModule } from "@/features/circuits";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

export default function NewCircuitPage() {
  return (
    <PermissionGate permission={circuitsModule.permissions.create!} fallback={<NotAuthorized />}>
      <CircuitsFormView mode="create" />
    </PermissionGate>
  );
}
