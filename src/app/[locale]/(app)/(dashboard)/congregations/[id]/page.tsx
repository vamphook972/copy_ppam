import { CongregationsDetailView, congregationsModule } from "@/features/congregations";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

interface CongregationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CongregationDetailPage({ params }: CongregationDetailPageProps) {
  const { id } = await params;

  return (
    <PermissionGate permission={congregationsModule.permissions.read} fallback={<NotAuthorized />}>
      <CongregationsDetailView id={id} />
    </PermissionGate>
  );
}
