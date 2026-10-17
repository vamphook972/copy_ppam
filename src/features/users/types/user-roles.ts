export const ASSIGNABLE_ROLES = [
  "COORDINATOR",
  "DATABASE",
  "CIRCUIT_SUPERINTENDENT",
  "ZONE-SUPERINTENDENT",
  "KEY_MAN",
  "KEY-MAN_ASSISTANT",
  "PLACE-MANAGER",
  "CAPACITATOR",
] as const;

export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

export const BASE_ROLE = "PARTICIPANT" as const;

export const ALL_ROLES = [...ASSIGNABLE_ROLES, BASE_ROLE] as const;
export type SystemRole = (typeof ALL_ROLES)[number];

export interface UserRoleItem {
  id: string;
  name: string;
  isSystem: boolean;
}

export interface UserRolesResponseDto {
  userId: string;
  roles: string[];
  roleDetails?: UserRoleItem[];
}

export interface UpdateUserRolesPayload {
  roles: string[];
}

export interface UpdateUserRolesResponseDto {
  userId: string;
  roles: string[];
}
