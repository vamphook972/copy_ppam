import { z } from "zod";

import type { BaseEntity, BaseQueryParams, ListResponse } from "@/shared/types/crud-module.types";

import { circuitFormSchema } from "../schemas/circuit-form.schema";

export type CircuitStatus = "ACTIVE" | "INACTIVE";

// FormValues is derived from the Zod schema — never defined manually
export type CircuitFormValues = z.infer<typeof circuitFormSchema>;

export interface CircuitDto {
  id: string;
  name: string;
  status: CircuitStatus;
  superintendentId?: string;
  superintendent?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Circuit extends BaseEntity {
  id: string;
  name: string;
  status: CircuitStatus;
  superintendentId?: string;
  superintendent?: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CircuitsQueryParams extends BaseQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: CircuitStatus;
}

export type CircuitsListResponse = ListResponse<Circuit>;
