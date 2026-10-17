"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button, Input, Label, Select, Typography } from "@/components/atoms";
import { FiltersPanel } from "@/components/organisms";
import { Link } from "@/i18n/navigation";

import { notificationsApi } from "../api/notifications.api";
import { NotificationTemplatesTable } from "./notification-templates-table";

type DashboardState = "loading" | "empty" | "error" | "success";

interface NotificationTemplatesPageContentProps {
  query: {
    page: number;
    pageSize: number;
    search: string;
    language?: string;
  };
}

export function NotificationTemplatesPageContent({ query }: NotificationTemplatesPageContentProps) {
  const t = useTranslations("emailTemplates");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page") ?? query.page) || 1);
  const pageSize = Math.max(1, Number(searchParams.get("pageSize") ?? query.pageSize) || 25);
  const search = searchParams.get("search") ?? query.search;
  const langParam = searchParams.get("language");
  const language = (langParam === "all" ? undefined : langParam) ?? query.language;

  const activeQuery = {
    page,
    pageSize,
    search: search || undefined,
    language,
  };

  const templatesQuery = useQuery({
    queryKey: ["notification-templates", activeQuery],
    queryFn: () => notificationsApi.getTemplates(activeQuery),
    retry: 1,
  });

  const rows = templatesQuery.data?.items ?? [];
  const pagination = templatesQuery.data?.pagination ?? {
    page,
    pageSize,
    totalItems: rows.length,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
    total: rows.length,
  };

  const tableStatus: DashboardState = templatesQuery.isPending
    ? "loading"
    : templatesQuery.isError
      ? "error"
      : rows.length === 0
        ? "empty"
        : "success";

  const updateQueryParams = (updates: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleFilterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = formData.get("search")?.toString().trim() ?? "";
    const language = formData.get("language")?.toString().trim() ?? "";

    updateQueryParams({
      search: search || undefined,
      language: language === "all" ? undefined : language,
      page: 1,
    });
  };

  return (
    <main className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div x-data="{ pageName: 'Notification Templates' }">
          <Typography variant="h1">{t("title")}</Typography>
          <Typography variant="body">{t("subtitle")}</Typography>
        </div>

        <Button className="shrink-0">
          <Link href="/email-templates/new">{t("primaryAction")}</Link>
        </Button>
      </header>

      {/* Filters */}
      <FiltersPanel title={t("filters.title")} description={t("filters.description")}>
        <form onSubmit={handleFilterSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="templates-search">{t("filters.searchLabel")}</Label>
            <Input
              id="templates-search"
              name="search"
              defaultValue={query.search}
              placeholder={t("filters.searchPlaceholder")}
              type="search"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="templates-language">{t("filters.languageLabel")}</Label>
            <Select id="templates-language" name="language" defaultValue={query.language ?? "all"}>
              <option value="all">{t("filters.languageAll")}</option>
              <option value="es">Español (es)</option>
              <option value="en">English (en)</option>
            </Select>
          </div>

          <div className="md:col-span-2 md:flex md:justify-end">
            <Button type="submit" className="w-full md:w-auto md:min-w-36">
              {t("filters.apply")}
            </Button>
          </div>
        </form>
      </FiltersPanel>

      <NotificationTemplatesTable
        data={rows}
        pagination={pagination}
        onPageChange={(page) => updateQueryParams({ page })}
        onPageSizeChange={(pageSize) => updateQueryParams({ pageSize, page: 1 })}
        status={tableStatus}
      />
    </main>
  );
}
