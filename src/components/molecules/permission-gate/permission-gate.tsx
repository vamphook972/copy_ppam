"use client";

import { ReactNode } from "react";

import { usePermission } from "@/providers";
import { Permission } from "@/types";

interface PermissionGateProps {
  permission?: Permission | Permission[];
  mode?: "any" | "all";
  adminOnly?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({
  permission,
  mode = "any",
  adminOnly = false,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { can, canAny, isAdmin } = usePermission();

  let hasPermission = false;

  if (adminOnly) {
    hasPermission = isAdmin;
  } else if (permission) {
    const permissions = Array.isArray(permission) ? permission : [permission];
    hasPermission = mode === "any" ? canAny(permissions) : permissions.every((p) => can(p));
  }

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
