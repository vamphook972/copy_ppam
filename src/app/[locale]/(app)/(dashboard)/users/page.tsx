import { UsersListView, usersModule } from "@/features/users";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

interface UsersPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;

  return (
    <PermissionGate permission={usersModule.permissions.read} fallback={<NotAuthorized />}>
      <UsersListView searchParams={params} />
    </PermissionGate>
  );
}
