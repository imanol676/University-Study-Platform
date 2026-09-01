import { describe, it, expect, vi, beforeEach } from "vitest";
import { R2StorageAdapter } from "../r2-storage.adapter";
import { S3Client } from "@aws-sdk/client-s3";

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn().mockResolvedValue("https://r2.cloudflarestorage.com/presigned-url"),
}));

describe("R2StorageAdapter", () => {
  let mockS3Client: S3Client;
  let adapter: R2StorageAdapter;

  beforeEach(() => {
    mockS3Client = {
      send: vi.fn().mockResolvedValue({ ContentLength: 1024 }),
    } as unknown as S3Client;

    adapter = new R2StorageAdapter(mockS3Client, "test-bucket");
  });

  it("debe generar Presigned Upload URL correctamente", async () => {
    const url = await adapter.getPresignedUploadUrl({
      key: "users/user-1/courses/course-1/materials/mat-1/file.pdf",
      contentType: "application/pdf",
    });

    expect(url).toBe("https://r2.cloudflarestorage.com/presigned-url");
  });

  it("debe generar Presigned Download URL correctamente", async () => {
    const url = await adapter.getPresignedDownloadUrl({
      key: "users/user-1/courses/course-1/materials/mat-1/file.pdf",
      filename: "archivo.pdf",
    });

    expect(url).toBe("https://r2.cloudflarestorage.com/presigned-url");
  });

  it("debe ejecutar deleteObject correctamente", async () => {
    await adapter.deleteObject("users/user-1/courses/course-1/materials/mat-1/file.pdf");
    expect(mockS3Client.send).toHaveBeenCalled();
  });

  it("debe consultar headObject y verificar existencia", async () => {
    const result = await adapter.headObject("users/user-1/courses/course-1/materials/mat-1/file.pdf");
    expect(result.exists).toBe(true);
    expect(result.contentLength).toBe(1024);
  });
});
