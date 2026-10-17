import { z } from "zod";

import type { Pagination } from "@/shared/types/api";

import { addCoordinatorSchema, createTenantSchema } from "../schemas/tenant.schema";

export type CreateTenantRequest = z.infer<typeof createTenantSchema>;
export type AddCoordinatorRequest = z.infer<typeof addCoordinatorSchema>;

export interface TenantDto {
  id: string;
  name: string;
  status: "ACTIVE" | "SUSPENDED";
  config: Record<string, unknown>;
  centerLat?: number | null;
  centerLng?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  status: "ACTIVE" | "SUSPENDED";
  config: Record<string, unknown>;
  centerLat?: number | null;
  centerLng?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface TenantsQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: "ACTIVE" | "SUSPENDED";
}

export interface TenantsListResponse {
  items: Tenant[];
  pagination: Pagination;
}

export interface CoordinatorDto {
  id: string;
  email: string;
  role: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface Coordinator {
  id: string;
  email: string;
  role: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface CoordinatorsListResponse {
  items: Coordinator[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface PrivilegeLimitItem {
  maxDaily: number;
  maxWeekly: number;
  maxMonthly: number;
}

export type PrivilegeCode =
  | "PUBLISHER"
  | "AUXILIARY_PIONEER"
  | "REGULAR_PIONEER"
  | "SPECIAL_PIONEER"
  | "BETHEL_FAMILY_MEMBER"
  | "CIRCUIT_OVERSEER"
  | "CIRCUIT_OVERSEER_WIFE";

export type PrivilegeLimitsMap = Record<PrivilegeCode, PrivilegeLimitItem>;
