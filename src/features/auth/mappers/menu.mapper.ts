import { MenuNodeDto } from "@/features/auth/dto/menu.dto";
import { MenuNode } from "@/types/menu";

export function mapMenu(dto: MenuNodeDto): MenuNode {
  return {
    id: dto.id,
    title: dto.label,
    href: dto.route ?? null,
    icon: dto.icon,
    permissions: dto.permissions,
    children: dto.children?.map(mapMenu) || [],
  };
}
