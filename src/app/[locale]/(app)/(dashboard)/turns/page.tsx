import { turnsModule, TurnsMonitoringConsole } from "@/features/turns";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

export default async function TurnsPage() {
  return (
    <PermissionGate permission={turnsModule.permissions.read} fallback={<NotAuthorized />}>
      <TurnsMonitoringConsole />
    </PermissionGate>
  );
}
