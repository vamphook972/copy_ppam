import { CongregationsFormView, congregationsModule } from "@/features/congregations";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

interface CongregationEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function CongregationEditPage({ params }: CongregationEditPageProps) {
  const { id } = await params;

  return (
    <PermissionGate
      permission={congregationsModule.permissions.update!}
      fallback={<NotAuthorized />}
    >
      <CongregationsFormView mode="edit" id={id} />
    </PermissionGate>
  );
}
