import { describe, it, expect, vi, beforeEach } from "vitest";
import { MaterialService } from "../material.service";
import { IMaterialRepository } from "@/repositories/material.repository";
import { ICourseRepository } from "@/repositories/course.repository";
import { IStorageAdapter } from "@/services/storage/storage.interface";
import { Material } from "@/types/material";
import { Course } from "@/types/course";

describe("MaterialService", () => {
  let mockMaterialRepo: IMaterialRepository;
  let mockCourseRepo: ICourseRepository;
  let mockStorageAdapter: IStorageAdapter;
  let service: MaterialService;

  const sampleCourse: Course = {
    id: "course-123",
    userId: "user-123",
    name: "Sistemas Operativos",
    code: "SO-101",
    description: null,
    term: "2026",
    color: "INDIGO",
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const sampleMaterial: Material = {
    id: "mat-123",
    courseId: "course-123",
    userId: "user-123",
    title: "resumen.pdf",
    description: null,
    type: "PDF",
    status: "UPLOADED",
    r2Key: "users/user-123/courses/course-123/materials/mat-123/resumen.pdf",
    fileSize: 1024 * 1024,
    mimeType: "application/pdf",
    textContent: null,
    errorMessage: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockMaterialRepo = {
      findById: vi.fn().mockResolvedValue(sampleMaterial),
      findAllByCourseId: vi.fn().mockResolvedValue([sampleMaterial]),
      create: vi.fn().mockImplementation((data) =>
        Promise.resolve({
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      ),
      update: vi.fn().mockImplementation((id, data) =>
        Promise.resolve({
          ...sampleMaterial,
          ...data,
        })
      ),
      delete: vi.fn().mockResolvedValue(undefined),
      countByCourseId: vi.fn().mockResolvedValue(1),
      countAllByUserId: vi.fn().mockResolvedValue(1),
    };

    mockCourseRepo = {
      findById: vi.fn().mockResolvedValue(sampleCourse),
      findAllByUserId: vi.fn().mockResolvedValue([sampleCourse]),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      countActiveByUserId: vi.fn().mockResolvedValue(1),
    };

    mockStorageAdapter = {
      getPresignedUploadUrl: vi
        .fn()
        .mockResolvedValue("https://r2.cloudflarestorage.com/upload-url"),
      getPresignedDownloadUrl: vi
        .fn()
        .mockResolvedValue("https://r2.cloudflarestorage.com/download-url"),
      deleteObject: vi.fn().mockResolvedValue(undefined),
      headObject: vi.fn().mockResolvedValue({ exists: true, contentLength: 1024 }),
    };

    service = new MaterialService(
      mockMaterialRepo,
      mockCourseRepo,
      mockStorageAdapter
    );
  });

  describe("requestUploadUrl", () => {
    it("debe generar presigned URL y crear registro en DB para un archivo válido", async () => {
      const result = await service.requestUploadUrl("user-123", {
        courseId: "course-123",
        filename: "resumen.pdf",
        fileSize: 1024 * 1024,
        mimeType: "application/pdf",
      });

      expect(result.uploadUrl).toBe("https://r2.cloudflarestorage.com/upload-url");
      expect(result.materialId).toBeDefined();
      expect(mockMaterialRepo.create).toHaveBeenCalled();
    });

    it("debe denegar la subida si la materia no pertenece al usuario", async () => {
      await expect(
        service.requestUploadUrl("user-intruso", {
          courseId: "course-123",
          filename: "resumen.pdf",
          fileSize: 1024 * 1024,
          mimeType: "application/pdf",
        })
      ).rejects.toThrow("Materia no encontrada o no autorizada");
    });

    it("debe rechazar archivos que exceden el tamaño máximo", async () => {
      await expect(
        service.requestUploadUrl("user-123", {
          courseId: "course-123",
          filename: "archivo_gigante.pdf",
          fileSize: 30 * 1024 * 1024, // 30MB > 25MB
          mimeType: "application/pdf",
        })
      ).rejects.toThrow("El archivo supera el tamaño máximo permitido");
    });
  });

  describe("confirmUpload", () => {
    it("debe actualizar el estado a READY", async () => {
      const updated = await service.confirmUpload("user-123", "mat-123");
      expect(mockMaterialRepo.update).toHaveBeenCalledWith("mat-123", {
        status: "READY",
      });
      expect(updated.status).toBe("READY");
    });

    it("debe denegar confirmación a usuarios ajenos", async () => {
      await expect(
        service.confirmUpload("user-intruso", "mat-123")
      ).rejects.toThrow("Material no encontrado o no autorizado");
    });
  });

  describe("createNote", () => {
    it("debe crear una nota de texto en estado READY", async () => {
      const note = await service.createNote("user-123", {
        courseId: "course-123",
        title: "Apuntes Clase 1",
        content: "Contenido de prueba sobre procesos e hilos.",
      });

      expect(note.type).toBe("NOTE");
      expect(note.status).toBe("READY");
      expect(mockMaterialRepo.create).toHaveBeenCalled();
    });
  });

  describe("getMaterialsByCourse", () => {
    it("debe listar los materiales de la materia del usuario", async () => {
      const list = await service.getMaterialsByCourse("user-123", "course-123");
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe("mat-123");
    });

    it("debe denegar acceso a materias de otro usuario", async () => {
      await expect(
        service.getMaterialsByCourse("user-intruso", "course-123")
      ).rejects.toThrow("Materia no encontrada o no autorizada");
    });
  });

  describe("getDownloadUrl", () => {
    it("debe generar una presigned download URL para el propietario", async () => {
      const url = await service.getDownloadUrl("user-123", "mat-123");
      expect(url).toBe("https://r2.cloudflarestorage.com/download-url");
    });

    it("debe denegar la descarga a usuarios ajenos", async () => {
      await expect(
        service.getDownloadUrl("user-intruso", "mat-123")
      ).rejects.toThrow("Material no encontrado o no autorizado");
    });
  });

  describe("deleteMaterial", () => {
    it("debe eliminar el objeto en R2 y en la base de datos", async () => {
      await service.deleteMaterial("user-123", "mat-123");
      expect(mockStorageAdapter.deleteObject).toHaveBeenCalledWith(
        sampleMaterial.r2Key
      );
      expect(mockMaterialRepo.delete).toHaveBeenCalledWith("mat-123");
    });

    it("debe denegar la eliminación a usuarios ajenos", async () => {
      await expect(
        service.deleteMaterial("user-intruso", "mat-123")
      ).rejects.toThrow("Material no encontrado o no autorizado");
    });
  });
});
