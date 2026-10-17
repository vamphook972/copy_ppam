import type { ProfileMeResponseDto } from "@/features/auth/dto/profile.dto";

export type { ProfileMeResponseDto };

export interface UpdateProfileMePayload {
  preferredName?: string | null;
  phones: {
    primary: {
      countryCode: string;
      number: string;
      label?: string | null;
      hasWhatsapp?: boolean;
    };
    alternate: Array<{
      countryCode: string;
      number: string;
      label?: string | null;
      hasWhatsapp?: boolean;
    }>;
  };
  maritalStatus?: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
  spouse?: {
    participatesInPpam: boolean;
    fullName?: string | null;
    marriedLastName?: string | null;
  } | null;
  languages?: Array<{
    languageCode: string;
    isPrimary: boolean;
  }>;
  availability?: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
  requestedServicePrivilegeId?: number | null;
}
