import { NotificationTemplatesPageContent } from "@/features/notifications";
import { PermissionGate } from "@/components/molecules";
import { NotAuthorized } from "@/components/organisms";

interface NotificationTemplatesPageProps {
  searchParams?: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    language?: string;
  }>;
}

export default async function NotificationTemplatesPage({
  searchParams,
}: NotificationTemplatesPageProps) {
  const params = await searchParams;

  const page = Math.max(1, Number(params?.page ?? "1") || 1);
  const pageSize = Math.max(1, Number(params?.pageSize ?? "25") || 25);
  const search = params?.search?.trim() ?? "";
  const language = params?.language?.trim() ?? "";

  return (
    <PermissionGate adminOnly fallback={<NotAuthorized />}>
      <NotificationTemplatesPageContent
        query={{
          page,
          pageSize,
          search,
          language,
        }}
      />
    </PermissionGate>
  );
}
