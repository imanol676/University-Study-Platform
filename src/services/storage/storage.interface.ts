export interface IStorageAdapter {
  getPresignedUploadUrl(params: {
    key: string;
    contentType: string;
    expiresInSeconds?: number;
  }): Promise<string>;

  getPresignedDownloadUrl(params: {
    key: string;
    filename?: string;
    expiresInSeconds?: number;
  }): Promise<string>;

  deleteObject(key: string): Promise<void>;
  headObject(key: string): Promise<{ exists: boolean; contentLength?: number }>;
}
