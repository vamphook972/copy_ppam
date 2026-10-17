import { PrivilegeLimitsMap } from "./tenant";

export interface GeneralSettings {
  featureFlag: boolean;
  invitationExpiryDays: number;
  maxZonesPerManager: number;
  maxFormsPending: number;
  maxDaysWithoutCapacitation: number;
  centerLat?: number | null;
  centerLng?: number | null;
}

export interface NotificationSettings {
  whatsapp: boolean;
  whatsappNumber?: string;
}

export interface EvaluationChecklistSettingItem {
  id: string;
  label: string;
  isRequired: boolean;
}

export interface TenantSettings {
  tenantId: string;
  tenantName: string;
  status: "ACTIVE" | "SUSPENDED";
  general: GeneralSettings;
  notifications: NotificationSettings;
  privilegeLimits: PrivilegeLimitsMap;
  evaluationChecklist: EvaluationChecklistSettingItem[];
  updatedAt?: string;
}

export interface UpdateSettingsRequest {
  general?: Partial<GeneralSettings>;
  notifications?: Partial<NotificationSettings>;
  privilegeLimits?: Partial<PrivilegeLimitsMap>;
  evaluationChecklist?: EvaluationChecklistSettingItem[];
}
