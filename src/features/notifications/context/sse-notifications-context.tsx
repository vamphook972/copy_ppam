"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { mapSseEventToUiNotification } from "../mappers/notification.mapper";
import type { SseNotificationEvent, UiNotificationItem } from "../types/notification";

interface SseNotificationsContextValue {
  notifications: UiNotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addEvents: (events: SseNotificationEvent[]) => void;
}

const SseNotificationsContext = createContext<SseNotificationsContextValue | undefined>(undefined);

interface SseNotificationsProviderProps {
  children: ReactNode;
}

export function SseNotificationsProvider({ children }: SseNotificationsProviderProps) {
  const t = useTranslations("dashboard.topbar.sse");
  const [notifications, setNotifications] = useState<UiNotificationItem[]>([]);

  const addEvents = useCallback(
    (events: SseNotificationEvent[]) => {
      if (!events.length) return;

      setNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const newItems: UiNotificationItem[] = [];

        for (const event of events) {
          if (!existingIds.has(event.id)) {
            newItems.push(mapSseEventToUiNotification(event, t));
            existingIds.add(event.id);
          }
        }

        if (newItems.length === 0) return prev;

        return [...newItems, ...prev];
      });
    },
    [t]
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => n.unread).length, [notifications]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      addEvents,
    }),
    [notifications, unreadCount, markAsRead, markAllAsRead, addEvents]
  );

  return (
    <SseNotificationsContext.Provider value={value}>{children}</SseNotificationsContext.Provider>
  );
}

export function useSseNotificationsContext(): SseNotificationsContextValue {
  const context = useContext(SseNotificationsContext);
  if (!context) {
    throw new Error("useSseNotificationsContext must be used within a SseNotificationsProvider");
  }
  return context;
}
