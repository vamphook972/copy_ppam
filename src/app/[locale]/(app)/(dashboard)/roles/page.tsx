import { RolesDashboard } from "@/features/roles";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

export default async function RolesPage() {
  return (
    <PermissionGate permission="role:read" fallback={<NotAuthorized />}>
      <RolesDashboard />
    </PermissionGate>
  );
}
