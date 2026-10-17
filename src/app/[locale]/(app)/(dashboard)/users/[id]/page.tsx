import { UsersDetailView, usersModule } from "@/features/users";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;

  return (
    <PermissionGate permission={usersModule.permissions.read} fallback={<NotAuthorized />}>
      <UsersDetailView id={id} />
    </PermissionGate>
  );
}
