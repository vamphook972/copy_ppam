import { ProfileMeResponseDto } from "@/features/auth/dto/profile.dto";
import { apiClient } from "@/lib/http";

const PROFILE_ME_ENDPOINT = "/v1/profile/me";

interface ApiWrappedPayload<T> {
  data: T[] | T;
}

type ApiResult<T> = ApiWrappedPayload<T> | T[] | T;

function isWrappedPayload<T>(payload: ApiResult<T>): payload is ApiWrappedPayload<T> {
  return typeof payload === "object" && payload !== null && "data" in payload;
}

export const permissionsApi = {
  async getMyPermissions(): Promise<ProfileMeResponseDto> {
    const payload = await apiClient.get<ApiResult<ProfileMeResponseDto>>(PROFILE_ME_ENDPOINT);

    const rawData = isWrappedPayload(payload) ? payload.data : payload;
    const dto = Array.isArray(rawData) ? rawData[0] : (rawData as ProfileMeResponseDto);

    if (!dto) {
      throw new Error("Profile not found");
    }

    return dto;
  },
};
