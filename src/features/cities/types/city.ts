import z from "zod";

import type { BaseEntity, BaseQueryParams, ListResponse } from "@/shared/types/crud-module.types";

import { cityFormSchema } from "../schemas/city-form.schema";

export type CityStatus = "ACTIVE" | "INACTIVE";

export type CityFormRequest = z.infer<typeof cityFormSchema>;

export interface CityDto {
  id: string;
  name: string;
  status: CityStatus;
  postalCode?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface City extends BaseEntity {
  id: string;
  name: string;
  status: CityStatus;
  postalCode?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CitiesQueryParams extends BaseQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: CityStatus;
  sort?: "name" | "createdAt";
  direction?: "asc" | "desc";
}

export type CitiesListResponse = ListResponse<City>;

export interface CityFormValues {
  name: string;
  postalCode?: string;
  status: CityStatus;
}
