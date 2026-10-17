import { z } from "zod";

import type { BaseEntity, BaseQueryParams, ListResponse } from "@/shared/types/crud-module.types";

import { congregationFormSchema } from "../schemas/congregation-form.schema";

export type CongregationStatus = "ACTIVE" | "INACTIVE";

// FormValues is derived from the Zod schema — never defined manually
export type CongregationFormValues = z.infer<typeof congregationFormSchema>;

export interface CircuitDto {
  id: string;
  name: string;
}

export interface CityDto {
  id: string;
  name: string;
}

export interface CongregationDto {
  id: string;
  name: string;
  cityId: string;
  city?: CityDto;
  circuitId: string;
  circuit?: CircuitDto;
  status: CongregationStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Congregation extends BaseEntity {
  id: string;
  name: string;
  cityId: string;
  city?: CityDto;
  circuitId: string;
  circuit?: CircuitDto;
  status: CongregationStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CongregationsQueryParams extends BaseQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  cityId?: string;
  circuitId?: string;
  status?: CongregationStatus;
}

export type CongregationsListResponse = ListResponse<Congregation>;
