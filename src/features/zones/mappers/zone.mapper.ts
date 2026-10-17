import type { Zone, ZoneDto } from "../types/zone";

export function mapZoneDtoToZone(dto: ZoneDto): Zone {
  return {
    id: dto.id,
    name: dto.name,
    cityId: dto.cityId,
    cityName: dto.city?.name ?? "-",
    status: dto.status,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}
