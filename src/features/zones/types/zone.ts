import { z } from "zod";

import type { BaseEntity, BaseQueryParams, ListResponse } from "@/shared/types/crud-module.types";

import { zoneFormSchema } from "../schemas/zone-form.schema";

export type ZoneStatus = "ACTIVE" | "INACTIVE";

export type ZoneFormValues = z.infer<typeof zoneFormSchema>;

export interface ZoneDto {
  id: string;
  name: string;
  cityId: string;
  city?: {
    id: string;
    name: string;
  };
  status: ZoneStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Zone extends BaseEntity {
  id: string;
  name: string;
  cityId: string;
  cityName: string;
  status: ZoneStatus;
  statusLabel?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ZoneManagerDto {
  id: string;
  userId: string;
  zoneId: string;
  status: ZoneStatus;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ZonesQueryParams extends BaseQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ZoneStatus;
  cityId?: string;
  sort?: string;
  direction?: "asc" | "desc";
}

export type ZonesListResponse = ListResponse<Zone>;
