import type { User } from "@/features/users";
import type { Pagination } from "@/shared/types/api";

export type RoleCategory = "ADMINISTRATION" | "SUPERVISION" | "OPERATIONS" | "TRAINING" | "SUPPORT";

export interface Role {
  id: string;
  name: string;
  isSystem: boolean;
  category?: RoleCategory;
}

export interface RoleDto {
  id: string;
  name: string;
  isSystem: boolean;
}

export interface RoleUsersQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface RoleUsersResponse {
  items: User[];
  pagination: Pagination;
}

export interface SystemPermission {
  id: string;
  action: string;
  description: string | null;
}

export interface CreateRoleInput {
  name: string;
}

export const ROLE_CATEGORIES: Record<string, RoleCategory> = {
  COORDINATOR: "ADMINISTRATION",
  CIRCUIT_SUPERINTENDENT: "SUPERVISION",
  "ZONE-SUPERINTENDENT": "SUPERVISION",
  KEY_MAN: "OPERATIONS",
  "KEY-MAN_ASSISTANT": "OPERATIONS",
  "PLACE-MANAGER": "OPERATIONS",
  CAPACITATOR: "TRAINING",
  PARTICIPANT: "OPERATIONS",
  DATABASE: "SUPPORT",
};
