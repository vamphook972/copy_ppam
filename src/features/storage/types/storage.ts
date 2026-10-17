export interface RequestUploadUrlPayload {
  moduleName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
}

export interface UploadUrlResponse {
  id: string;
  fileKey: string;
  contentType: string;
  uploadUrl: string;
  expiresIn: number;
}

export interface StorageFile {
  id: string;
  tenantId: string;
  moduleName: string;
  fileKey: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: string;
  status: "PENDING" | "UPLOADED" | "FAILED";
  createdAt: string;
  updatedAt: string;
}

export interface DownloadUrlResponse {
  id: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  downloadUrl: string;
}
