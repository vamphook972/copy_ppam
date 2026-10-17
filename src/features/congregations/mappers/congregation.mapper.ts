import type { Congregation, CongregationDto } from "../types/congregation";

export function mapCongregationDtoToCongregation(dto: CongregationDto): Congregation {
  return {
    id: dto.id,
    name: dto.name,
    cityId: dto.cityId,
    city: dto.city,
    circuitId: dto.circuitId,
    circuit: dto.circuit,
    status: dto.status,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}
