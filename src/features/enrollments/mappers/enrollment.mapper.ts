import type {
  ContactAttempt,
  ContactAttemptDto,
  Enrollment,
  EnrollmentDto,
} from "../types/enrollment";

export function mapContactAttemptDtoToContactAttempt(dto: ContactAttemptDto): ContactAttempt {
  return {
    id: dto.id,
    method: dto.method,
    notes: dto.notes,
    result: dto.result,
    attemptedAt: dto.attemptedAt,
    nextAttemptAt: dto.nextAttemptAt,
    contactedBy: dto.contactedBy,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function mapEnrollmentDtoToEnrollment(dto: EnrollmentDto): Enrollment {
  return {
    id: dto.id,
    userId: dto.userId,
    email: dto.email,
    countryCode: dto.countryCode || "+57",
    phoneNumber: dto.phoneNumber,
    status: dto.status,
    fileUrl: dto.fileUrl,
    fileId: dto.fileId,
    verifiedBy: dto.verifiedBy,
    firstName: dto.firstName,
    lastName: dto.lastName,
    contactAttempts: (dto.contactAttempts || []).map(mapContactAttemptDtoToContactAttempt),
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}
