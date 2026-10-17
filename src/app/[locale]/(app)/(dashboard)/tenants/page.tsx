import { TenantsPageContent } from "@/features/tenants";
import { PermissionGate } from "@/components/molecules";
import { NotAuthorized } from "@/components/organisms";

interface TenantsPageProps {
  searchParams?: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    status?: "ACTIVE" | "SUSPENDED";
  }>;
}

export default async function TenantsPage({ searchParams }: TenantsPageProps) {
  const params = await searchParams;

  const page = Math.max(1, Number(params?.page ?? "1") || 1);
  const pageSize = Math.max(1, Number(params?.pageSize ?? "25") || 25);
  const search = params?.search?.trim() ?? "";
  const status = params?.status;

  return (
    <PermissionGate adminOnly fallback={<NotAuthorized />}>
      <TenantsPageContent
        query={{
          page,
          pageSize,
          search,
          status,
        }}
      />
    </PermissionGate>
  );
}
