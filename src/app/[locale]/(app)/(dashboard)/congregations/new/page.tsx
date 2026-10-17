import { CongregationsFormView, congregationsModule } from "@/features/congregations";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

export default function NewCongregationPage() {
  return (
    <PermissionGate
      permission={congregationsModule.permissions.create!}
      fallback={<NotAuthorized />}
    >
      <CongregationsFormView mode="create" />
    </PermissionGate>
  );
}
