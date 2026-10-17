export interface AuditLogDto {
  id: string;
  tenantId: string;
  actorId: string;
  targetUserId?: string | null;
  entityType: string;
  action: string;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface AuditLogsQueryParams {
  targetUserId?: string;
  actorId?: string;
  entityType?: string;
  page?: number;
  pageSize?: number;
}

export interface AuditLogsListResponse {
  items: AuditLogDto[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}
