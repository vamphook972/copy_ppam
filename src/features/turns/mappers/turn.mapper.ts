import type { Turn, TurnDto } from "../types/turn";

export function mapTurnDtoToTurn(dto: TurnDto): Turn {
  return {
    id: dto.id,
    name: dto.name,
    status: dto.status,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}
