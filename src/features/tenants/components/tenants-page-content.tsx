"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button, Input, Label, Typography } from "@/components/atoms";
import { FiltersPanel } from "@/components/organisms";
import { Link } from "@/i18n/navigation";

import { tenantsApi } from "../api/tenants.api";
import { TenantsTable } from "./tenants-table";

type DashboardState = "loading" | "empty" | "error" | "success";

interface TenantsPageContentProps {
  query: {
    page: number;
    pageSize: number;
    search: string;
    status?: "ACTIVE" | "SUSPENDED";
  };
}

export function TenantsPageContent({ query }: TenantsPageContentProps) {
  const t = useTranslations("tenants");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page") ?? query.page) || 1);
  const pageSize = Math.max(1, Number(searchParams.get("pageSize") ?? query.pageSize) || 25);
  const search = searchParams.get("search") ?? query.search;
  const statusParam = searchParams.get("status");
  const status =
    (statusParam === "all" ? undefined : (statusParam as "ACTIVE" | "SUSPENDED" | undefined)) ??
    query.status;

  const activeQuery = {
    page,
    pageSize,
    search: search || undefined,
    status,
  };

  const tenantsQuery = useQuery({
    queryKey: ["tenants", activeQuery],
    queryFn: () => tenantsApi.getTenants(activeQuery),
    retry: 1,
  });

  const rows = tenantsQuery.data?.items ?? [];
  const pagination = tenantsQuery.data?.pagination ?? {
    page,
    pageSize,
    totalItems: rows.length,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
    total: rows.length,
  };

  const tableStatus: DashboardState = tenantsQuery.isPending
    ? "loading"
    : tenantsQuery.isError
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
    const status = formData.get("status")?.toString().trim() ?? "";

    updateQueryParams({
      search: search || undefined,
      status: status === "all" ? undefined : status,
      page: 1,
    });
  };

  return (
    <main className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div x-data="{ pageName: 'Tenants' }">
          <Typography variant="h1">{t("title")}</Typography>
          <Typography variant="body">{t("subtitle")}</Typography>
        </div>

        <Button className="shrink-0">
          <Link href="/tenants/new">{t("primaryAction")}</Link>
        </Button>
      </header>

      {/* Filters */}
      <FiltersPanel title={t("filters.title")} description={t("filters.description")}>
        <form onSubmit={handleFilterSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="tenants-search">{t("filters.searchLabel")}</Label>
            <Input
              id="tenants-search"
              name="search"
              defaultValue={query.search}
              placeholder={t("filters.searchPlaceholder")}
              type="search"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tenants-status">{t("filters.statusLabel")}</Label>
            <select
              id="tenants-status"
              name="status"
              className="border-input bg-background text-foreground focus-visible:border-primary focus-visible:ring-primary/20 h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-1"
              defaultValue={query.status ?? "all"}
            >
              <option value="all">{t("filters.statusAll")}</option>
              <option value="ACTIVE">{t("filters.statusActive")}</option>
              <option value="SUSPENDED">{t("filters.statusSuspended")}</option>
            </select>
          </div>

          <div className="md:col-span-2 md:flex md:justify-end">
            <Button type="submit" className="w-full md:w-auto md:min-w-36">
              {t("filters.apply")}
            </Button>
          </div>
        </form>
      </FiltersPanel>

      <TenantsTable
        data={rows}
        pagination={pagination}
        onPageChange={(page) => updateQueryParams({ page })}
        onPageSizeChange={(pageSize) => updateQueryParams({ pageSize, page: 1 })}
        status={tableStatus}
      />
    </main>
  );
}
