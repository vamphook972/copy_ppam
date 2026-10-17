"use client";

import { Bell, Info, ShieldAlert, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";

import { useSseNotificationsContext } from "@/features/notifications";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NotificationsDropdown() {
  const t = useTranslations("dashboard.topbar");
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSseNotificationsContext();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="border-border bg-card text-foreground hover:bg-muted relative size-9 rounded-lg shadow-2xs transition-colors"
          aria-label={t("notifications")}
          title={t("notifications")}
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="bg-primary ring-card absolute top-2 right-2 size-2 rounded-full ring-2" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="shadow-dropdown w-80 p-0 sm:w-96">
        {/* Header */}
        <div className="border-border bg-muted/30 flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-foreground text-sm font-bold">{t("notifications")}</span>
            {unreadCount > 0 && (
              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-semibold">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-primary text-xs font-medium hover:underline"
            >
              {t("markAllRead")}
            </button>
          )}
        </div>

        {/* List */}
        <div className="divide-border/60 max-h-80 divide-y overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-muted-foreground p-6 text-center text-xs">
              {t("notificationsEmpty")}
            </div>
          ) : (
            notifications.map((item) => (
              <DropdownMenuItem
                key={item.id}
                onClick={() => markAsRead(item.id)}
                className={`flex cursor-pointer items-start gap-3 p-3.5 transition-colors ${
                  item.unread ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/40"
                }`}
              >
                <div
                  className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ${
                    item.type === "info"
                      ? "bg-primary/10 text-primary"
                      : item.type === "alert"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-success/10 text-success"
                  }`}
                >
                  {item.type === "info" && <Info className="size-4" />}
                  {item.type === "alert" && <ShieldAlert className="size-4" />}
                  {item.type === "user" && <UserPlus className="size-4" />}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`truncate text-xs font-semibold ${item.unread ? "text-foreground font-bold" : "text-foreground/80"}`}
                    >
                      {item.title}
                    </p>
                    <span className="text-muted-foreground shrink-0 text-[10px]">{item.time}</span>
                  </div>
                  <p className="text-muted-foreground line-clamp-2 text-xs leading-tight">
                    {item.description}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>

        <DropdownMenuSeparator className="m-0" />

        {/* Footer */}
        <div className="bg-muted/20 p-2 text-center">
          <button
            type="button"
            className="text-primary w-full py-1 text-xs font-semibold hover:underline"
          >
            {t("viewAll")}
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
