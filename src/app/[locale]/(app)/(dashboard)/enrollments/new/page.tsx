import { EnrollmentsFormView, enrollmentsModule } from "@/features/enrollments";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

export default function NewEnrollmentPage() {
  return (
    <PermissionGate permission={enrollmentsModule.permissions.create!} fallback={<NotAuthorized />}>
      <EnrollmentsFormView mode="create" />
    </PermissionGate>
  );
}
