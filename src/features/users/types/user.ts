import { z } from "zod";

import type { BaseEntity, BaseQueryParams, ListResponse } from "@/shared/types/crud-module.types";

import { userFormSchema } from "../schemas/user-form.schema";

export type UserStatus =
  "ACTIVE" | "INACTIVE" | "PENDING_FORM" | "PENDING_CAPACITATION" | "IN_TRAINING";

// FormValues is derived from the Zod schema — never defined manually
export type UserFormValues = z.infer<typeof userFormSchema>;

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roles?: string[];
  status: UserStatus;
  congregationId?: string;
  privilege?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User extends BaseEntity {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roles?: string[];
  status: UserStatus;
  congregationId?: string;
  privilege?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UsersQueryParams extends BaseQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: UserStatus;
}

export type UsersListResponse = ListResponse<User>;
