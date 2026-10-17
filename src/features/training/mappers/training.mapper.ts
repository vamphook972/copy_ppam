import type { Training, TrainingDto } from "../types/training";

export function mapTrainingDtoToTraining(dto: TrainingDto): Training {
  return {
    id: dto.id,
    userId: dto.userId,
    enrollmentId: dto.enrollmentId ?? "",
    capacitatorId: dto.capacitatorId,
    placeId: dto.placeId,
    scheduledAt: dto.scheduledAt,
    attemptNumber: dto.attemptNumber ?? 1,
    status: dto.status ?? "CREATED",
    evaluationChecklist: dto.evaluationChecklist,
    notes: dto.notes,
    evaluatedAt: dto.evaluatedAt,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    userName: dto.userName,
    userPhone: dto.userPhone,
    userEmail: dto.userEmail,
    capacitatorName: dto.capacitatorName,
    placeName: dto.placeName,
  };
}
