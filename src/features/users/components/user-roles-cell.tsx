import * as React from "react";

import type { User } from "../types/user";
import { RoleBadge } from "./role-badge";

export interface UserRolesCellProps {
  user: User;
}

export function UserRolesCell({ user }: UserRolesCellProps) {
  const roles = user.roles && user.roles.length > 0 ? user.roles : ["PARTICIPANT"];

  return (
    <div className="flex max-w-[320px] flex-wrap items-center gap-1.5">
      {roles.map((role) => (
        <RoleBadge key={role} role={role} />
      ))}
    </div>
  );
}
