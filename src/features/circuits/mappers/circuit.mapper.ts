import type { Circuit, CircuitDto } from "../types/circuit";

export function mapCircuitDtoToCircuit(dto: CircuitDto): Circuit {
  return {
    id: dto.id,
    name: dto.name,
    status: dto.status,
    superintendentId: dto.superintendentId,
    superintendent: {
      id: dto.superintendent?.id ?? "",
      fullName: `${dto.superintendent?.firstName ?? ""} ${dto.superintendent?.lastName ?? ""}`,
      email: dto.superintendent?.email ?? "",
      phoneNumber: dto.superintendent?.phoneNumber ?? "",
    },
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}
