import type { Place, PlaceDto } from "../types/place";

export function mapPlaceDtoToPlace(dto: PlaceDto): Place {
  return {
    id: dto.id,
    name: dto.name,
    address: dto.address,
    location: dto.location,
    parkingAddress: dto.parkingAddress,
    parkingEmail: dto.parkingEmail,
    minParticipants: dto.minParticipants,
    maxParticipants: dto.maxParticipants,
    type: dto.type,
    cityId: dto.cityId,
    zoneId: dto.zoneId,
    cityName: dto.city?.name ?? "-",
    zoneName: dto.zone?.name ?? "-",
    placeManagerId: dto.placeManagerId,
    placeManagerName: dto.placeManager?.name ?? "-",
    status: dto.status,
    hasCustomSchedule: dto.hasCustomSchedule,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}
