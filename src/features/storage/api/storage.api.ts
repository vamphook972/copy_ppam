import { axiosClient } from "@/lib/http/axios-client";

import type {
  DownloadUrlResponse,
  RequestUploadUrlPayload,
  StorageFile,
  UploadUrlResponse,
} from "../types/storage";

export const storageApi = {
  getUploadUrl: async (payload: RequestUploadUrlPayload): Promise<UploadUrlResponse> => {
    const res = await axiosClient.post<UploadUrlResponse | { data: UploadUrlResponse }>(
      "/v1/storage/upload-url",
      payload
    );
    return "data" in res ? res.data : res;
  },

  uploadToS3: async (uploadUrl: string, file: File): Promise<void> => {
    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/pdf",
      },
      body: file,
    });
    if (!res.ok) {
      throw new Error(`Failed to upload file to S3 storage. Status: ${res.status}`);
    }
  },

  confirmUpload: async (fileId: string): Promise<void> => {
    await axiosClient.post(`/v1/storage/files/${fileId}/confirm`);
  },

  getFileInfo: async (fileId: string): Promise<StorageFile> => {
    const res = await axiosClient.get<StorageFile | { data: StorageFile }>(
      `/v1/storage/files/${fileId}`
    );
    return "data" in res ? res.data : res;
  },

  getDownloadUrl: async (fileId: string): Promise<DownloadUrlResponse> => {
    const res = await axiosClient.get<DownloadUrlResponse | { data: DownloadUrlResponse }>(
      `/v1/storage/files/${fileId}/download-url`
    );
    return "data" in res ? res.data : res;
  },

  uploadFile: async (file: File, moduleName: string = "enrollment"): Promise<UploadUrlResponse> => {
    const uploadUrlData = await storageApi.getUploadUrl({
      moduleName,
      originalName: file.name,
      mimeType: file.type || "application/pdf",
      fileSize: file.size,
    });
    await storageApi.uploadToS3(uploadUrlData.uploadUrl, file);
    await storageApi.confirmUpload(uploadUrlData.id);
    return uploadUrlData;
  },
};
