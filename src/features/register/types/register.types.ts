export interface ValidateInvitationResponseDto {
  enrollmentId: string;
  tenantId: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

export interface UserPhoneInput {
  countryCode: string;
  number: string;
  label?: string | null;
}

export interface UserLanguageInput {
  languageCode: string;
  isPrimary: boolean;
}

export interface UserSpouseInput {
  participatesInPpam: boolean;
  fullName?: string | null;
}

export interface UserAvailabilityInput {
  dayOfWeek: number; // 0..6
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
}

export type UserGender = "MALE" | "FEMALE";

export type UserMaritalStatus = "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED" | "SEPARATED";

export interface RegisterParticipantInput {
  token: string;
  password: string;
  phoneNumber: string;
  preferredName?: string | null;
  phones: {
    primary: UserPhoneInput;
    alternate?: UserPhoneInput[] | null;
  };
  gender: UserGender;
  birthDate: string; // YYYY-MM-DD
  baptismDate: string; // YYYY-MM-DD
  congregationId?: string | null;
  languages?: UserLanguageInput[];
  maritalStatus: UserMaritalStatus;
  spouse?: UserSpouseInput | null;
  availability?: UserAvailabilityInput[] | null;
}

export interface RegisterParticipantResponseDto {
  userId: string;
  email: string;
  enrollmentId: string;
}
