import { z } from "zod";

import type { BaseEntity, BaseQueryParams, ListResponse } from "@/shared/types/crud-module.types";

import { placeFormSchema } from "../schemas/place-form.schema";

export type PlaceStatus = "ACTIVE" | "INACTIVE";
export type PlaceType = "REGULAR" | "EVENT" | "SPECIAL_EVENT";

export type PlaceFormValues = z.infer<typeof placeFormSchema>;

export interface PlaceDto {
  id: string;
  name: string;
  address: string;
  type: PlaceType;
  location: {
    latitude: number;
    longitude: number;
  };
  parkingAddress?: string;
  parkingEmail?: string;
  minParticipants?: number;
  maxParticipants?: number;
  cityId: string;
  zoneId: string;
  city?: {
    id: string;
    name: string;
  };
  zone?: {
    id: string;
    name: string;
  };
  placeManagerId?: string;
  placeManager?: {
    id: string;
    name: string;
  };
  status: PlaceStatus;
  hasCustomSchedule?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Place extends BaseEntity {
  id: string;
  name: string;
  address: string;
  type: PlaceType;
  location: {
    latitude: number;
    longitude: number;
  };
  parkingAddress?: string;
  parkingEmail?: string;
  minParticipants?: number;
  maxParticipants?: number;
  cityId: string;
  zoneId: string;
  cityName?: string;
  zoneName?: string;
  placeManagerId?: string;
  placeManagerName?: string;
  status: PlaceStatus;
  hasCustomSchedule?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlacesQueryParams extends BaseQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  cityId?: string;
  zoneId?: string;
  placeManagerId?: string;
  type?: PlaceType;
  status?: PlaceStatus;
}

export type PlacesListResponse = ListResponse<Place>;
