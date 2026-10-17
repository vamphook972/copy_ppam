import { MenuNodeDto } from "@/features/auth/dto/menu.dto";

export interface PermissionsResponseDto {
  isAdmin: boolean;
  tree: MenuNodeDto[];
}
