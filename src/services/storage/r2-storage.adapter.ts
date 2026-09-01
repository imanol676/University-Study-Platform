import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { IStorageAdapter } from "./storage.interface";

export class R2StorageAdapter implements IStorageAdapter {
  private client: S3Client | null = null;
  private bucketName: string;

  constructor(
    customClient?: S3Client,
    bucketName?: string
  ) {
    this.bucketName =
      bucketName ??
      process.env.CLOUDFLARE_R2_BUCKET_NAME ??
      "university-study-platform";

    if (customClient) {
      this.client = customClient;
    } else {
      const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
      const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
      const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

      if (accountId && accessKeyId && secretAccessKey) {
        this.client = new S3Client({
          region: "auto",
          endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId,
            secretAccessKey,
          },
        });
      } else {
        // En entorno local o CI sin credenciales R2 configuradas aún
        console.warn(
          "[R2StorageAdapter] Variables de Cloudflare R2 no detectadas en .env. Las operaciones de almacenamiento requerirán configuración de R2."
        );
      }
    }
  }

  private getClient(): S3Client {
    if (!this.client) {
      throw new Error(
        "El cliente de Cloudflare R2 no está configurado. Por favor define CLOUDFLARE_R2_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID y CLOUDFLARE_R2_SECRET_ACCESS_KEY en tu archivo .env"
      );
    }
    return this.client;
  }

  async getPresignedUploadUrl(params: {
    key: string;
    contentType: string;
    expiresInSeconds?: number;
  }): Promise<string> {
    const client = this.getClient();
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: params.key,
      ContentType: params.contentType,
    });

    return getSignedUrl(client, command, {
      expiresIn: params.expiresInSeconds ?? 600, // 10 minutos por defecto
    });
  }

  async getPresignedDownloadUrl(params: {
    key: string;
    filename?: string;
    expiresInSeconds?: number;
  }): Promise<string> {
    const client = this.getClient();
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: params.key,
      ResponseContentDisposition: params.filename
        ? `inline; filename="${encodeURIComponent(params.filename)}"`
        : undefined,
    });

    return getSignedUrl(client, command, {
      expiresIn: params.expiresInSeconds ?? 900, // 15 minutos por defecto
    });
  }

  async deleteObject(key: string): Promise<void> {
    const client = this.getClient();
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await client.send(command);
  }

  async headObject(
    key: string
  ): Promise<{ exists: boolean; contentLength?: number }> {
    try {
      const client = this.getClient();
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await client.send(command);
      return {
        exists: true,
        contentLength: response.ContentLength,
      };
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "name" in error &&
        (error.name === "NotFound" || error.name === "NoSuchKey")
      ) {
        return { exists: false };
      }
      return { exists: false };
    }
  }
}

export const r2StorageAdapter = new R2StorageAdapter();
