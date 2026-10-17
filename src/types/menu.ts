export interface MenuNode {
  id: string;
  title: string;
  href: string | null;
  icon?: string;
  permissions?: string[];
  children: MenuNode[];
  group?: string;
  badge?: string | number;
}
