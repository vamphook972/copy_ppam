import { EnrollmentsDetailView, enrollmentsModule } from "@/features/enrollments";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

interface EnrollmentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EnrollmentDetailPage({ params }: EnrollmentDetailPageProps) {
  const { id } = await params;

  return (
    <PermissionGate permission={enrollmentsModule.permissions.read} fallback={<NotAuthorized />}>
      <EnrollmentsDetailView id={id} />
    </PermissionGate>
  );
}
