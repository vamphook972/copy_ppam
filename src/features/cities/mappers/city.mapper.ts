import type { City, CityDto } from "../types/city";

export function mapCityDtoToCity(dto: CityDto): City {
  return {
    id: dto.id,
    name: dto.name,
    status: dto.status,
    postalCode: dto.postalCode ?? null,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}
