import { TrainingListView, trainingModule } from "@/features/training";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

interface TrainingPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TrainingPage({ searchParams }: TrainingPageProps) {
  const params = await searchParams;

  return (
    <PermissionGate permission={trainingModule.permissions.read} fallback={<NotAuthorized />}>
      <TrainingListView searchParams={params} />
    </PermissionGate>
  );
}
