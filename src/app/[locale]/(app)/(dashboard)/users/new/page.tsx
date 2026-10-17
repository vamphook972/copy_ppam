import { UsersFormView, usersModule } from "@/features/users";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

export default function NewUserPage() {
  return (
    <PermissionGate permission={usersModule.permissions.create!} fallback={<NotAuthorized />}>
      <UsersFormView mode="create" />
    </PermissionGate>
  );
}
