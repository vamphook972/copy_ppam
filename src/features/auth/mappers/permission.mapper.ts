import { MenuNodeDto } from "@/features/auth/dto/menu.dto";
import { ProfileMeResponseDto } from "@/features/auth/dto/profile.dto";
import { mapMenu } from "@/features/auth/mappers/menu.mapper";
import { PermissionState } from "@/features/auth/types/permission";
import { Permission } from "@/types/permission";
import { User } from "@/types/user";

function collectPermissions(nodes: MenuNodeDto[]): Permission[] {
  const permissionSet = new Set<Permission>();

  const visit = (items: MenuNodeDto[]) => {
    items.forEach((node) => {
      node.permissions.forEach((permission) => permissionSet.add(permission as Permission));

      if (node.children.length > 0) {
        visit(node.children);
      }
    });
  };

  visit(nodes);

  return Array.from(permissionSet);
}

export function mapPermissions(dto: ProfileMeResponseDto): PermissionState {
  const profileUser = dto.user;
  const profileTenant = dto.tenant;
  const sessionDto = dto.session;

  const fullName = `${profileUser.firstName} ${profileUser.lastName}`.trim() || profileUser.email;

  const user: User = {
    id: profileUser.id,
    email: profileUser.email,
    firstName: profileUser.firstName,
    lastName: profileUser.lastName,
    fullName,
    preferredName: profileUser.preferredName,
    tenant: {
      id: profileTenant.id,
      name: profileTenant.name,
    },
    status: profileUser.status,
    roles: sessionDto.roles ?? (sessionDto.isAdmin ? ["ADMIN"] : []),
  };

  const permissions =
    sessionDto.permissions && sessionDto.permissions.length > 0
      ? (sessionDto.permissions as Permission[])
      : collectPermissions(sessionDto.tree);

  return {
    isAdmin: sessionDto.isAdmin,
    menu: sessionDto.tree.map(mapMenu),
    permissions,
    user,
  };
}
