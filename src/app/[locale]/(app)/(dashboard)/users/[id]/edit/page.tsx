import { UsersFormView, usersModule } from "@/features/users";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

interface UserEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserEditPage({ params }: UserEditPageProps) {
  const { id } = await params;

  return (
    <PermissionGate permission={usersModule.permissions.update!} fallback={<NotAuthorized />}>
      <UsersFormView mode="edit" id={id} />
    </PermissionGate>
  );
}
