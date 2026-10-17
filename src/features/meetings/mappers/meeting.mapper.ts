import type { Attendance, AttendanceDto, Meeting, MeetingDto } from "../types/meeting";

export function mapMeetingDtoToMeeting(dto: MeetingDto): Meeting {
  return {
    id: dto.id,
    type: dto.type,
    title: dto.title,
    description: dto.description,
    location: dto.location,
    scheduledAt: dto.scheduledAt,
    maxParticipants: dto.maxParticipants,
    zoneId: dto.zoneId,
    status: dto.status,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function mapAttendanceDtoToAttendance(dto: AttendanceDto): Attendance {
  return {
    id: dto.id,
    meetingId: dto.meetingId,
    enrollmentId: dto.enrollmentId,
    participantId: dto.participantId,
    status: dto.status,
    recordedBy: dto.recordedBy,
    recordedAt: dto.recordedAt,
    notes: dto.notes,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}
