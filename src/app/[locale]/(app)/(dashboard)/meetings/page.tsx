import { MeetingsListView, meetingsModule } from "@/features/meetings";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

interface MeetingsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MeetingsPage({ searchParams }: MeetingsPageProps) {
  const params = await searchParams;

  return (
    <PermissionGate permission={meetingsModule.permissions.read} fallback={<NotAuthorized />}>
      <MeetingsListView searchParams={params} />
    </PermissionGate>
  );
}
