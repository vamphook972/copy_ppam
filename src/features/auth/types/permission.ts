import { MenuNode } from "@/types/menu";
import { Permission } from "@/types/permission";
import { User } from "@/types/user";

export interface PermissionState {
  isAdmin: boolean;
  menu: MenuNode[];
  permissions: Permission[];
  user?: User;
}
