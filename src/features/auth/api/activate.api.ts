import { apiClient, ApiResult, isWrappedPayload } from "@/lib/http";

import type {
  ActivateUserInput,
  ActivateUserResponseDto,
  ActivateVerifyResponseDto,
} from "../types/activate.types";

export const activateApi = {
  verifyActivationToken: async (token: string): Promise<ActivateVerifyResponseDto> => {
    const response = await apiClient.get<ApiResult<ActivateVerifyResponseDto>>(
      "/v1/auth/activate/verify",
      {
        params: { token },
      }
    );
    const rawData = isWrappedPayload(response) ? response.data : response;
    const dto = Array.isArray(rawData) ? rawData[0] : rawData;
    return dto as ActivateVerifyResponseDto;
  },

  activateUser: async (payload: ActivateUserInput): Promise<ActivateUserResponseDto> => {
    return apiClient.post<ActivateUserResponseDto>("/v1/auth/activate", payload);
  },
};
