import type { User, UserDto } from "../types/user";

export function mapUserDtoToUser(dto: UserDto): User {
  return {
    id: dto.id,
    email: dto.email,
    firstName: dto.firstName,
    lastName: dto.lastName,
    phoneNumber: dto.phoneNumber,
    roles: dto.roles,
    status: dto.status,
    congregationId: dto.congregationId,
    privilege: dto.privilege,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}
