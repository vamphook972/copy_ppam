import { EnrollmentsFormView, enrollmentsModule } from "@/features/enrollments";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

interface EnrollmentEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EnrollmentEditPage({ params }: EnrollmentEditPageProps) {
  const { id } = await params;

  return (
    <PermissionGate permission={enrollmentsModule.permissions.update!} fallback={<NotAuthorized />}>
      <EnrollmentsFormView mode="edit" id={id} />
    </PermissionGate>
  );
}
