export interface MenuNodeDto {
  id: string;
  label: string;
  icon: string;
  route: string | null;
  permissions: string[];
  children: MenuNodeDto[];
}
