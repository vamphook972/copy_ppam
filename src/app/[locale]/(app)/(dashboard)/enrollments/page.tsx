import { EnrollmentsListView, enrollmentsModule } from "@/features/enrollments";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

interface EnrollmentsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function EnrollmentsPage({ searchParams }: EnrollmentsPageProps) {
  const params = await searchParams;

  return (
    <PermissionGate permission={enrollmentsModule.permissions.read} fallback={<NotAuthorized />}>
      <EnrollmentsListView searchParams={params} />
    </PermissionGate>
  );
}
