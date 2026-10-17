import { axiosClient } from "@/lib/http/axios-client";

import { mapEnrollmentDtoToEnrollment } from "../mappers/enrollment.mapper";
import type {
  Enrollment,
  EnrollmentDto,
  EnrollmentFormValues,
  InvitationTokenValidationResponse,
  RecordContactAttemptPayload,
} from "../types/enrollment";

function unwrap<T>(res: T | { data: T }): T {
  return typeof res === "object" && res !== null && "data" in res ? (res as { data: T }).data : res;
}

export const enrollmentsApi = {
  create: async (payload: EnrollmentFormValues): Promise<Enrollment> => {
    const res = await axiosClient.post<EnrollmentDto | { data: EnrollmentDto }>(
      "/v1/enrollments",
      payload
    );
    return mapEnrollmentDtoToEnrollment(unwrap(res));
  },

  getById: async (id: string): Promise<Enrollment> => {
    const res = await axiosClient.get<EnrollmentDto | { data: EnrollmentDto }>(
      `/v1/enrollments/${id}`
    );
    return mapEnrollmentDtoToEnrollment(unwrap(res));
  },

  recordContactAttempt: async (
    id: string,
    payload: RecordContactAttemptPayload
  ): Promise<Enrollment> => {
    const res = await axiosClient.post<EnrollmentDto | { data: EnrollmentDto }>(
      `/v1/enrollments/${id}/contact-attempts`,
      payload
    );
    return mapEnrollmentDtoToEnrollment(unwrap(res));
  },

  confirmContact: async (id: string): Promise<Enrollment> => {
    const res = await axiosClient.post<EnrollmentDto | { data: EnrollmentDto }>(
      `/v1/enrollments/${id}/confirm-contact`
    );
    return mapEnrollmentDtoToEnrollment(unwrap(res));
  },

  validateInvitationToken: async (token: string): Promise<InvitationTokenValidationResponse> => {
    const res = await axiosClient.get<
      InvitationTokenValidationResponse | { data: InvitationTokenValidationResponse }
    >("/v1/enrollments/invitation", { params: { token } });
    return unwrap(res);
  },
};
