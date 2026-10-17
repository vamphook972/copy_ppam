"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { notificationsApi } from "../api/notifications.api";
import type { SseNotificationEvent } from "../types/notification";

export const DEFAULT_MODULE_QUERY_KEYS: Record<string, readonly string[]> = {
  training: ["trainings"],
  enrollment: ["enrollments"],
  users: ["users"],
  participant: ["users"],
};

export interface UseSseNotificationsOptions {
  enabled?: boolean;
  intervalMs?: number;
  onEventsReceived?: (events: SseNotificationEvent[]) => void;
  invalidationMap?: Record<string, readonly string[]>;
}

export function useSseNotifications(options?: UseSseNotificationsOptions) {
  const {
    enabled = true,
    intervalMs = 12000,
    onEventsReceived,
    invalidationMap = DEFAULT_MODULE_QUERY_KEYS,
  } = options || {};

  const queryClient = useQueryClient();
  const lastEventTimestamp = useRef<string | undefined>(undefined);
  const onEventsReceivedRef = useRef(onEventsReceived);

  useEffect(() => {
    onEventsReceivedRef.current = onEventsReceived;
  }, [onEventsReceived]);

  useEffect(() => {
    if (!enabled) return;

    let isMounted = true;

    const fetchNotifications = async () => {
      if (document.hidden) return;

      try {
        const events = await notificationsApi.streamNotifications(lastEventTimestamp.current);

        if (!isMounted || events.length === 0) return;

        // Actualizamos el cursor con el último timestamp
        const lastEvent = events[events.length - 1];
        lastEventTimestamp.current = lastEvent.createdAt;

        // 1. Notificar callback externo (ej: Contexto de UI)
        if (onEventsReceivedRef.current) {
          onEventsReceivedRef.current(events);
        }

        // 2. Resolver dinámicamente qué Query Keys invalidar en React Query sin if/else (SOLID - OCP)
        const keysToInvalidate = new Set<string>();

        for (const ev of events) {
          const moduleKey = ev.module?.toLowerCase();
          const targetKeys = invalidationMap[moduleKey];

          if (targetKeys) {
            for (const key of targetKeys) {
              keysToInvalidate.add(key);
            }
          }
        }

        // Invalidación desacoplada
        for (const queryKey of keysToInvalidate) {
          void queryClient.invalidateQueries({ queryKey: [queryKey] });
        }
      } catch (err) {
        console.warn("SSE Polling check non-fatal error:", err);
      }
    };

    void fetchNotifications();

    const intervalId = setInterval(fetchNotifications, intervalMs);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [enabled, intervalMs, invalidationMap, queryClient]);
}
