import { MeetingsFormView, meetingsModule } from "@/features/meetings";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

export default function NewMeetingPage() {
  return (
    <PermissionGate permission={meetingsModule.permissions.create!} fallback={<NotAuthorized />}>
      <MeetingsFormView mode="create" />
    </PermissionGate>
  );
}
