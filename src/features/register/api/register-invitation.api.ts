import { apiClient, ApiResult, isWrappedPayload } from "@/lib/http";

import type {
  RegisterParticipantInput,
  RegisterParticipantResponseDto,
  ValidateInvitationResponseDto,
} from "../types/register.types";

export const registerApi = {
  validateInvitationToken: async (token: string): Promise<ValidateInvitationResponseDto> => {
    const response = await apiClient.get<ApiResult<ValidateInvitationResponseDto>>(
      "/v1/enrollments/invitation/validate",
      {
        params: { token },
      }
    );
    const rawData = isWrappedPayload(response) ? response.data : response;
    const dto = Array.isArray(rawData) ? rawData[0] : rawData;
    return dto as ValidateInvitationResponseDto;
  },

  registerParticipant: async (
    payload: RegisterParticipantInput
  ): Promise<RegisterParticipantResponseDto> => {
    const response = await apiClient.post<ApiResult<RegisterParticipantResponseDto>>(
      "/v1/users/register",
      payload
    );
    const rawData = isWrappedPayload(response) ? response.data : response;
    const dto = Array.isArray(rawData) ? rawData[0] : rawData;
    return dto as RegisterParticipantResponseDto;
  },
};
