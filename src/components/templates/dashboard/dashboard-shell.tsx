"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { usePermission, useSession } from "@/providers";
import {
  SseNotificationsProvider,
  useSseNotifications,
  useSseNotificationsContext,
} from "@/features/notifications";

import { MainContent } from "./content/main-content";
import { Sidebar } from "./sidebar/sidebar";
import { Topbar } from "./topbar/topbar";

interface DashboardShellProps {
  children: ReactNode;
}

function DashboardLayoutContent({ children }: DashboardShellProps) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { session, isLoading: isSessionLoading } = useSession();
  const {
    refreshPermissions,
    menu,
    user,
    isAdmin,
    isLoading: isPermissionsLoading,
  } = usePermission();
  const { addEvents } = useSseNotificationsContext();
  const hasLoadedPermissionsRef = useRef(false);

  const isUserActive = Boolean(isAdmin || user?.status?.code === "ACTIVE");

  useSseNotifications({
    enabled: Boolean(session?.isAuthenticated && !isPermissionsLoading && isUserActive),
    onEventsReceived: addEvents,
  });

  useEffect(() => {
    if (!session?.isAuthenticated) {
      hasLoadedPermissionsRef.current = false;
      return;
    }

    if (hasLoadedPermissionsRef.current) {
      return;
    }

    hasLoadedPermissionsRef.current = true;
    void refreshPermissions();
  }, [refreshPermissions, session?.isAuthenticated]);

  useEffect(() => {
    if (
      !isPermissionsLoading &&
      user &&
      !isAdmin &&
      user.status?.code &&
      user.status.code !== "ACTIVE"
    ) {
      router.replace(`/${locale}/account-pending`);
    }
  }, [isPermissionsLoading, user, isAdmin, router, locale]);

  if (
    isSessionLoading ||
    isPermissionsLoading ||
    !session?.user ||
    (!isAdmin && user?.status?.code && user.status.code !== "ACTIVE")
  ) {
    return (
      <div className="bg-background text-foreground flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-muted-foreground animate-pulse text-sm font-medium">
            {t("loadingData")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground h-screen overflow-hidden antialiased">
      <div className="flex h-full min-h-0">
        <Sidebar
          items={menu ?? []}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
          <MainContent>{children}</MainContent>
        </div>
      </div>
    </div>
  );
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <SseNotificationsProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SseNotificationsProvider>
  );
}
