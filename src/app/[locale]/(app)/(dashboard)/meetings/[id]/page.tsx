import { MeetingsDetailView, meetingsModule } from "@/features/meetings";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

interface MeetingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MeetingDetailPage({ params }: MeetingDetailPageProps) {
  const { id } = await params;

  return (
    <PermissionGate permission={meetingsModule.permissions.read} fallback={<NotAuthorized />}>
      <MeetingsDetailView id={id} />
    </PermissionGate>
  );
}
