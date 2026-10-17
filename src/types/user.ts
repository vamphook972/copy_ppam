export interface UserTenant {
  id: string;
  name: string;
}

export interface UserStatus {
  code: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  preferredName?: string | null;
  avatar?: string;
  locale?: string;
  tenant?: UserTenant;
  status?: UserStatus;
  roles?: string[];
}
