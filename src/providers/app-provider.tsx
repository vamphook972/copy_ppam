"use client";

import type { ReactNode } from "react";

import { Session } from "@/types/auth";

import { AuthProvider } from "./auth-provider";
import { PermissionProvider } from "./permission-provider";
import { QueryProvider } from "./query-provider";
import { SessionProvider } from "./session-provider";

interface AppProviderProps {
  children: ReactNode;
  initialSession?: Session | null;
}

export function AppProvider({ children, initialSession }: AppProviderProps) {
  return (
    <QueryProvider>
      <SessionProvider initialSession={initialSession}>
        <AuthProvider>
          <PermissionProvider>{children}</PermissionProvider>
        </AuthProvider>
      </SessionProvider>
    </QueryProvider>
  );
}
