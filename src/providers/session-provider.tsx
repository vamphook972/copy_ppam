"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useIdleTimer } from "@/hooks/use-idle-timer";
import { authClient } from "@/lib/auth";
import { Session } from "@/types/auth";

interface SessionContextValue {
  session: Session | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  refreshSession: () => Promise<Session | null>;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
  initialSession?: Session | null;
}

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutos de inactividad
const REFRESH_MARGIN_MS = 10 * 60 * 1000; // Renovar 10 minutos antes del vencimiento

export function SessionProvider({ children, initialSession }: SessionProviderProps) {
  const [session, setSessionState] = useState<Session | null>(initialSession ?? null);
  // We are loading if we don't have a session, OR if we have a session but it's missing the user object
  const [isLoading, setIsLoading] = useState(!initialSession || !initialSession.user);

  const setSession = useCallback((nextSession: Session | null) => {
    setSessionState(nextSession);
  }, []);

  const refreshSession = useCallback(async () => {
    const refreshed = await authClient.refreshSession();
    setSessionState(refreshed);

    if (refreshed?.tokens) {
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: refreshed.tokens.accessToken,
          idToken: refreshed.tokens.idToken,
        }),
      });
    }

    return refreshed;
  }, []);

  // Manejador de inactividad de usuario (15 min sin eventos DOM)
  const handleIdle = useCallback(async () => {
    if (session?.isAuthenticated) {
      setSessionState(null);
      await authClient.signOut({ global: false });
      await fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
      if (typeof window !== "undefined") {
        window.location.href = "/login?reason=inactivity";
      }
    }
  }, [session?.isAuthenticated]);

  useIdleTimer({
    timeoutMs: IDLE_TIMEOUT_MS,
    onIdle: handleIdle,
    enabled: Boolean(session?.isAuthenticated),
  });

  // Programar Silent Refresh Proactivo
  useEffect(() => {
    if (!session?.isAuthenticated || !session.tokens?.expiresAt) {
      return;
    }

    const expiresAtMs = session.tokens.expiresAt * 1000;
    const nowMs = Date.now();
    const timeUntilRefresh = expiresAtMs - nowMs - REFRESH_MARGIN_MS;

    // Si ya venció o falta menos del margen, renovar inmediatamente en 1s
    const delay = Math.max(timeUntilRefresh, 1000);

    const refreshTimer = setTimeout(() => {
      void refreshSession();
    }, delay);

    return () => {
      clearTimeout(refreshTimer);
    };
  }, [refreshSession, session?.isAuthenticated, session?.tokens?.expiresAt]);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        await authClient.initialize();

        // If we already have a fully populated session (e.g. hydrated from somewhere with user data), skip fetch
        // In our case, initialSession only has isAuthenticated, so we DO need to fetch user data
        if (initialSession && initialSession.user) {
          return;
        }

        const currentSession = await authClient.getSession();

        if (isMounted) {
          setSessionState(currentSession);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, [initialSession]);

  const value = useMemo(
    () => ({
      session,
      isLoading,
      setSession,
      refreshSession,
    }),
    [isLoading, refreshSession, session, setSession]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }

  return context;
}
