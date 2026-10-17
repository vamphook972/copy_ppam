import { MeetingsFormView, meetingsModule } from "@/features/meetings";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

interface MeetingEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function MeetingEditPage({ params }: MeetingEditPageProps) {
  const { id } = await params;

  return (
    <PermissionGate permission={meetingsModule.permissions.update!} fallback={<NotAuthorized />}>
      <MeetingsFormView mode="edit" id={id} />
    </PermissionGate>
  );
}
