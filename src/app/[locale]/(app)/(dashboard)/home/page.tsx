import { AlertTriangle, CheckCircle2, Clock, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { PlanningBoard } from "@/features/onboarding";
import { Input, Label, Select, Typography } from "@/components/atoms";
import { StatCard, StatusBadge } from "@/components/molecules";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { DataTable, FiltersPanel } from "@/components/organisms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DashboardState = "loading" | "empty" | "error" | "success";

interface HomePageProps {
  searchParams?: Promise<{
    state?: DashboardState;
  }>;
}

interface AssignmentRow {
  id: string;
  territory: string;
  congregation: string;
  status: "pending" | "in-progress" | "completed";
  updatedAt: string;
}

const assignments: AssignmentRow[] = [
  {
    id: "a1",
    territory: "Norte 01",
    congregation: "Central",
    status: "pending",
    updatedAt: "2026-07-10",
  },
  {
    id: "a2",
    territory: "Sur 03",
    congregation: "Esperanza",
    status: "in-progress",
    updatedAt: "2026-07-09",
  },
  {
    id: "a3",
    territory: "Este 07",
    congregation: "Aurora",
    status: "completed",
    updatedAt: "2026-07-08",
  },
];

export default async function HomePage({ searchParams }: HomePageProps) {
  const t = await getTranslations("dashboard.home");
  const state = (await searchParams)?.state ?? "success";

  const tableStatus: DashboardState =
    state === "loading" || state === "empty" || state === "error" ? state : "success";

  return (
    <main className="space-y-6">
      {/* Page Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div x-data="{ pageName: 'Dashboard' }">
          <Typography variant="h1">{t("title")}</Typography>
          <Typography variant="subtitle">{t("subtitle")}</Typography>
        </div>

        <Button className="shrink-0">{t("primaryAction")}</Button>
      </header>

      {/* Onboarding planning goal + alert semaphore */}
      <PermissionGate permission={["enrollment:read", "meeting:read"]} mode="all">
        <PlanningBoard />
      </PermissionGate>

      {/* TailAdmin Stat Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("kpis.activeUsersLabel")}
          value={t("kpis.activeUsersValue")}
          icon={Users}
          iconBgTone="primary"
          change={{ value: "+12.5%", type: "increase" }}
        />
        <StatCard
          title={t("kpis.pendingAssignmentsLabel")}
          value={t("kpis.pendingAssignmentsValue")}
          icon={Clock}
          iconBgTone="warning"
          change={{ value: "+3.2%", type: "increase" }}
        />
        <StatCard
          title={t("kpis.completedVisitsLabel")}
          value={t("kpis.completedVisitsValue")}
          icon={CheckCircle2}
          iconBgTone="success"
          change={{ value: "+8.4%", type: "increase" }}
        />
        <StatCard
          title={t("kpis.alertsLabel")}
          value={t("kpis.alertsValue")}
          icon={AlertTriangle}
          iconBgTone="destructive"
          change={{ value: "-1.5%", type: "decrease" }}
        />
      </div>

      {/* Analytics & Overview Section */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-8">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg">{t("title")}</CardTitle>
              <p className="text-muted-foreground mt-0.5 text-xs">Overview of system activity</p>
            </div>
            <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold">
              This Month
            </span>
          </CardHeader>
          <CardContent>
            {/* Visual Analytics Bar Chart Simulation */}
            <div className="flex h-52 items-end justify-between gap-3 pt-6">
              {[40, 65, 80, 55, 90, 75, 60, 85, 95, 70, 50, 88].map((height, i) => (
                <div
                  key={i}
                  className="group relative flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <div
                    style={{ height: `${height}%` }}
                    className="bg-primary/80 group-hover:bg-primary w-full rounded-t-md transition-all duration-300"
                  />
                  <span className="text-muted-foreground text-[10px] font-semibold">
                    {
                      [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ][i]
                    }
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="border-border bg-background hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-success size-2 rounded-full" />
                <span className="text-sm font-medium">System Status</span>
              </div>
              <span className="text-success text-xs font-bold">Operational</span>
            </div>
            <div className="border-border bg-background hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-warning size-2 rounded-full" />
                <span className="font-sans text-sm font-medium">Pending Tasks</span>
              </div>
              <span className="text-warning text-xs font-bold">14 Tasks</span>
            </div>
            <div className="border-border bg-background hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-primary size-2 rounded-full" />
                <span className="text-sm font-medium">New Assignments</span>
              </div>
              <span className="text-primary text-xs font-bold">3 Active</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Panel */}
      <FiltersPanel title={t("filters.title")} description={t("filters.description")}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dashboard-search">{t("filters.searchLabel")}</Label>
            <Input
              id="dashboard-search"
              placeholder={t("filters.searchPlaceholder")}
              type="search"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dashboard-status">{t("filters.statusLabel")}</Label>
            <Select id="dashboard-status" defaultValue="all">
              <option value="all">{t("filters.statusAll")}</option>
              <option value="pending">{t("filters.statusPending")}</option>
              <option value="in-progress">{t("filters.statusInProgress")}</option>
              <option value="completed">{t("filters.statusCompleted")}</option>
            </Select>
          </div>
        </div>
      </FiltersPanel>

      {/* Data Table */}
      <DataTable
        caption={t("table.caption")}
        columns={[
          {
            id: "territory",
            header: t("table.columns.territory"),
            cell: (row) => row.territory,
          },
          {
            id: "congregation",
            header: t("table.columns.congregation"),
            cell: (row) => row.congregation,
          },
          {
            id: "status",
            header: t("table.columns.status"),
            cell: (row) => (
              <StatusBadge tone={row.status === "completed" ? "success" : "secondary"}>
                {row.status}
              </StatusBadge>
            ),
          },
          {
            id: "updatedAt",
            header: t("table.columns.updatedAt"),
            cell: (row) => row.updatedAt,
          },
        ]}
        rows={assignments}
        getRowId={(row) => row.id}
        status={tableStatus}
        loadingLabel={t("states.loading")}
        emptyTitle={t("states.emptyTitle")}
        emptyDescription={t("states.emptyDescription")}
        errorTitle={t("states.errorTitle")}
        errorDescription={t("states.errorDescription")}
      />
    </main>
  );
}
