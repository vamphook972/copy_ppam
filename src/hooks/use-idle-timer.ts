"use client";

import { useEffect, useRef } from "react";

const LISTEN_EVENTS: Array<keyof WindowEventMap> = [
  "mousemove",
  "keydown",
  "click",
  "scroll",
  "touchstart",
];

interface UseIdleTimerOptions {
  timeoutMs: number;
  onIdle: () => void;
  enabled?: boolean;
  throttleMs?: number;
}

export function useIdleTimer({
  timeoutMs,
  onIdle,
  enabled = true,
  throttleMs = 5000,
}: UseIdleTimerOptions): void {
  const onIdleRef = useRef(onIdle);
  const lastActivityRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    lastActivityRef.current = Date.now();

    const resetTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        onIdleRef.current();
      }, timeoutMs);
    };

    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastActivityRef.current >= throttleMs) {
        lastActivityRef.current = now;
        resetTimer();
      }
    };

    // Inicializar temporizador
    resetTimer();

    // Registrar escuchadores pasivos de eventos del DOM
    LISTEN_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleUserActivity, { passive: true });
    });

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      LISTEN_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleUserActivity);
      });
    };
  }, [enabled, timeoutMs, throttleMs]);
}
