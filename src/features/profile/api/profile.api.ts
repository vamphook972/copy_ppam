import { apiClient } from "@/lib/http";

import type { ProfileMeResponseDto, UpdateProfileMePayload } from "../types";

const PROFILE_ME_ENDPOINT = "/v1/profile/me";

interface ApiWrappedPayload<T> {
  data: T[] | T;
}

type ApiResult<T> = ApiWrappedPayload<T> | T[] | T;

function isWrappedPayload<T>(payload: ApiResult<T>): payload is ApiWrappedPayload<T> {
  return typeof payload === "object" && payload !== null && "data" in payload;
}

export const profileApi = {
  async getProfileMe(): Promise<ProfileMeResponseDto> {
    const payload = await apiClient.get<ApiResult<ProfileMeResponseDto>>(PROFILE_ME_ENDPOINT);
    const rawData = isWrappedPayload(payload) ? payload.data : payload;
    const dto = Array.isArray(rawData) ? rawData[0] : (rawData as ProfileMeResponseDto);

    if (!dto) {
      throw new Error("Profile not found");
    }
    return dto;
  },

  async updateProfileMe(data: UpdateProfileMePayload): Promise<void> {
    await apiClient.patch(PROFILE_ME_ENDPOINT, data);
  },
};
