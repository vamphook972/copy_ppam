"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";

import { permissionService } from "@/features/auth";
import { PermissionState } from "@/features/auth/types/permission";
import { authClient } from "@/lib/auth";
import { MenuNode, Permission, User } from "@/types";
import { Session } from "@/types/auth";

import { useSession } from "./session-provider";

interface PermissionContextValue {
  isLoading: boolean;
  isAdmin: boolean;
  permissions: Permission[];
  menu: MenuNode[];
  user?: User;
  can: (permission: Permission) => boolean;
  canAny: (requiredPermissions: Permission[]) => boolean;
  refreshPermissions: (activeSession?: Session | null) => Promise<PermissionState>;
  clearPermissions: () => void;
}

const PermissionContext = createContext<PermissionContextValue | undefined>(undefined);

interface PermissionProviderProps {
  children: ReactNode;
}

const emptyPermissionState: PermissionState = {
  isAdmin: false,
  menu: [],
  permissions: [],
};

export function PermissionProvider({ children }: PermissionProviderProps) {
  const { session } = useSession();
  const [permissionState, setPermissionState] = useState<PermissionState>(emptyPermissionState);
  const [isLoading, setIsLoading] = useState(Boolean(session?.isAuthenticated));

  const clearPermissions = useCallback(() => {
    setPermissionState((prev) =>
      prev.isAdmin === emptyPermissionState.isAdmin &&
      prev.menu.length === 0 &&
      prev.permissions.length === 0 &&
      !prev.user
        ? prev
        : emptyPermissionState
    );
  }, []);

  const refreshPermissions = useCallback(
    async (activeSession?: Session | null): Promise<PermissionState> => {
      const currentSession = activeSession ?? session ?? (await authClient.getSession());
      if (!currentSession?.isAuthenticated) {
        clearPermissions();
        setIsLoading(false);
        return emptyPermissionState;
      }

      setIsLoading(true);
      try {
        const nextPermissionState = await permissionService.getMyPermissions();
        setPermissionState(nextPermissionState);
        return nextPermissionState;
      } catch (error) {
        clearPermissions();
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [clearPermissions, session]
  );

  const can = useCallback(
    (permission: Permission) =>
      permissionState.isAdmin || permissionState.permissions.includes(permission),
    [permissionState.isAdmin, permissionState.permissions]
  );

  const canAny = useCallback(
    (requiredPermissions: Permission[]) =>
      permissionState.isAdmin ||
      requiredPermissions.length === 0 ||
      requiredPermissions.some((permission) => permissionState.permissions.includes(permission)),
    [permissionState.isAdmin, permissionState.permissions]
  );

  const value = useMemo<PermissionContextValue>(
    () => ({
      isLoading,
      isAdmin: permissionState.isAdmin,
      permissions: permissionState.permissions,
      menu: permissionState.menu,
      user: permissionState.user,
      can,
      canAny,
      refreshPermissions,
      clearPermissions,
    }),
    [
      can,
      canAny,
      clearPermissions,
      isLoading,
      permissionState.isAdmin,
      permissionState.permissions,
      permissionState.menu,
      permissionState.user,
      refreshPermissions,
    ]
  );

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

export function usePermission() {
  const context = useContext(PermissionContext);

  if (!context) {
    throw new Error("usePermission must be used within PermissionProvider");
  }

  return context;
}
