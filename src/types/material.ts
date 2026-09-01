export type MaterialType = "PDF" | "PPTX" | "AUDIO" | "IMAGE" | "NOTE";
export type MaterialStatus = "UPLOADED" | "PROCESSING" | "READY" | "ERROR";

export interface Material {
  id: string;
  courseId: string;
  userId: string;
  title: string;
  description: string | null;
  type: MaterialType;
  status: MaterialStatus;
  r2Key: string;
  fileSize: number;
  mimeType: string;
  textContent: string | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PresignedUploadResult {
  materialId: string;
  uploadUrl: string;
  r2Key: string;
  expiresInSeconds: number;
}

export interface MaterialFilter {
  type?: MaterialType;
  status?: MaterialStatus;
  search?: string;
}
