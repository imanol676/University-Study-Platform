import { randomUUID } from "crypto";
import {
  IMaterialRepository,
  materialRepository,
} from "@/repositories/material.repository";
import {
  ICourseRepository,
  courseRepository,
} from "@/repositories/course.repository";
import { IStorageAdapter } from "@/services/storage/storage.interface";
import { r2StorageAdapter } from "@/services/storage/r2-storage.adapter";
import {
  Material,
  MaterialType,
  PresignedUploadResult,
} from "@/types/material";
import {
  RequestUploadUrlInput,
  CreateNoteInput,
  UpdateMaterialInput,
  resolveMaterialType,
  MAX_FILE_SIZES,
} from "@/features/material/schemas/material.schema";
import { requestCache } from "@/lib/cache";

export interface IMaterialService {
  requestUploadUrl(
    userId: string,
    input: RequestUploadUrlInput
  ): Promise<PresignedUploadResult>;
  confirmUpload(userId: string, materialId: string): Promise<Material>;
  createNote(userId: string, input: CreateNoteInput): Promise<Material>;
  getMaterialsByCourse(
    userId: string,
    courseId: string,
    type?: MaterialType
  ): Promise<Material[]>;
  getDownloadUrl(userId: string, materialId: string): Promise<string>;
  updateMaterial(
    userId: string,
    materialId: string,
    input: UpdateMaterialInput
  ): Promise<Material>;
  deleteMaterial(userId: string, materialId: string): Promise<void>;
  getMaterialCountByCourse(courseId: string): Promise<number>;
  getTotalMaterialCount(userId: string): Promise<number>;
}

export class MaterialService implements IMaterialService {
  constructor(
    private readonly materialRepo: IMaterialRepository = materialRepository,
    private readonly courseRepo: ICourseRepository = courseRepository,
    private readonly storageAdapter: IStorageAdapter = r2StorageAdapter
  ) {}

  async requestUploadUrl(
    userId: string,
    input: RequestUploadUrlInput
  ): Promise<PresignedUploadResult> {
    if (!userId) {
      throw new Error("El ID de usuario es obligatorio");
    }

    const course = await this.courseRepo.findById(input.courseId);
    if (!course || course.userId !== userId) {
      throw new Error("Materia no encontrada o no autorizada");
    }

    const materialType = resolveMaterialType(input.mimeType, input.filename);
    if (!materialType) {
      throw new Error("Formato de archivo no admitido");
    }

    const maxSize = MAX_FILE_SIZES[materialType];
    if (input.fileSize > maxSize) {
      throw new Error("El archivo supera el tamaño máximo permitido");
    }

    const materialId = randomUUID();
    // Sanitizar nombre para la clave de almacenamiento
    const sanitizedFilename = input.filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const r2Key = `users/${userId}/courses/${input.courseId}/materials/${materialId}/${sanitizedFilename}`;

    const uploadUrl = await this.storageAdapter.getPresignedUploadUrl({
      key: r2Key,
      contentType: input.mimeType,
      expiresInSeconds: 600,
    });

    await this.materialRepo.create({
      id: materialId,
      courseId: input.courseId,
      userId,
      title: input.filename,
      description: input.description ?? null,
      type: materialType,
      status: "UPLOADED",
      r2Key,
      fileSize: input.fileSize,
      mimeType: input.mimeType,
      textContent: null,
      errorMessage: null,
    });

    return {
      materialId,
      uploadUrl,
      r2Key,
      expiresInSeconds: 600,
    };
  }

  async confirmUpload(userId: string, materialId: string): Promise<Material> {
    if (!userId || !materialId) {
      throw new Error("Parámetros inválidos");
    }

    const material = await this.materialRepo.findById(materialId);
    if (!material || material.userId !== userId) {
      throw new Error("Material no encontrado o no autorizado");
    }

    return this.materialRepo.update(materialId, {
      status: "READY",
    });
  }

  async createNote(userId: string, input: CreateNoteInput): Promise<Material> {
    if (!userId) {
      throw new Error("El ID de usuario es obligatorio");
    }

    const course = await this.courseRepo.findById(input.courseId);
    if (!course || course.userId !== userId) {
      throw new Error("Materia no encontrada o no autorizada");
    }

    const materialId = randomUUID();
    const r2Key = `users/${userId}/courses/${input.courseId}/materials/${materialId}/note.md`;
    const fileSize = Buffer.byteLength(input.content, "utf8");

    return this.materialRepo.create({
      id: materialId,
      courseId: input.courseId,
      userId,
      title: input.title,
      description: input.description ?? null,
      type: "NOTE",
      status: "READY",
      r2Key,
      fileSize,
      mimeType: "text/markdown",
      textContent: input.content,
      errorMessage: null,
    });
  }

  async getMaterialsByCourse(
    userId: string,
    courseId: string,
    type?: MaterialType
  ): Promise<Material[]> {
    if (!userId || !courseId) {
      return [];
    }

    const course = await this.courseRepo.findById(courseId);
    if (!course || course.userId !== userId) {
      throw new Error("Materia no encontrada o no autorizada");
    }

    return this.materialRepo.findAllByCourseId(courseId, type);
  }

  async getDownloadUrl(userId: string, materialId: string): Promise<string> {
    if (!userId || !materialId) {
      throw new Error("Parámetros inválidos");
    }

    const material = await this.materialRepo.findById(materialId);
    if (!material || material.userId !== userId) {
      throw new Error("Material no encontrado o no autorizado");
    }

    return this.storageAdapter.getPresignedDownloadUrl({
      key: material.r2Key,
      filename: material.title,
      expiresInSeconds: 900,
    });
  }

  async updateMaterial(
    userId: string,
    materialId: string,
    input: UpdateMaterialInput
  ): Promise<Material> {
    if (!userId || !materialId) {
      throw new Error("Parámetros inválidos");
    }

    const material = await this.materialRepo.findById(materialId);
    if (!material || material.userId !== userId) {
      throw new Error("Material no encontrado o no autorizado");
    }

    return this.materialRepo.update(materialId, {
      title: input.title,
      description: input.description,
      textContent: input.textContent,
    });
  }

  async deleteMaterial(userId: string, materialId: string): Promise<void> {
    if (!userId || !materialId) {
      throw new Error("Parámetros inválidos");
    }

    const material = await this.materialRepo.findById(materialId);
    if (!material || material.userId !== userId) {
      throw new Error("Material no encontrado o no autorizado");
    }

    try {
      if (material.type !== "NOTE" || material.r2Key) {
        await this.storageAdapter.deleteObject(material.r2Key);
      }
    } catch (err) {
      console.warn(
        `[MaterialService] No se pudo eliminar el objeto R2 ${material.r2Key}:`,
        err
      );
    }

    await this.materialRepo.delete(materialId);
  }

  getMaterialCountByCourse = requestCache(
    async (courseId: string): Promise<number> => {
      if (!courseId) return 0;
      return this.materialRepo.countByCourseId(courseId);
    }
  );

  getTotalMaterialCount = requestCache(
    async (userId: string): Promise<number> => {
      if (!userId) return 0;
      return this.materialRepo.countAllByUserId(userId);
    }
  );
}

export const materialService = new MaterialService();
