import { MenuNodeDto } from "./menu.dto";

export interface ProfileTenantDto {
  id: string;
  name: string;
}

export interface ProfileUserDto {
  id: string;
  firstName: string;
  lastName: string;
  preferredName: string | null;
  email: string;
  gender: "MALE" | "FEMALE";
  birthDate: string | null;
  baptismDate: string | null;
  status: {
    code: string;
    name: string;
  };
}

export interface ProfilePhoneDto {
  countryCode: string;
  number: string;
  label?: string | null;
  hasWhatsapp?: boolean;
}

export interface ProfileDetailsDto {
  phones: {
    primary: ProfilePhoneDto;
    alternate?: ProfilePhoneDto[] | null;
  };
  congregationId: string | null;
  languages: Array<{
    languageCode: string;
    isPrimary: boolean;
  }>;
  maritalStatus?: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
  spouse?: {
    participatesInPpam: boolean;
    fullName?: string | null;
    marriedLastName?: string | null;
  } | null;
  relationships: Array<{
    relatedUserId: string;
    relationshipTypeId: number;
    isPrimary: boolean;
    isConfirmed: boolean;
  }>;
  availability: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
  servicePrivileges?: Array<{
    id: number;
    code: string;
    name: string;
  }>;
  pendingServicePrivilegeRequest?: {
    id: string;
    servicePrivilegeId: number;
    status: "PENDING" | "APPROVED" | "REJECTED";
    requestedAt: string;
  } | null;
}

export interface ProfileSessionDto {
  isAdmin: boolean;
  roles?: string[];
  permissions?: string[];
  tree: MenuNodeDto[];
}

export interface ProfileMeResponseDto {
  tenant: ProfileTenantDto;
  user: ProfileUserDto;
  profile: ProfileDetailsDto;
  session: ProfileSessionDto;
}
