import { describe, it, expect } from "vitest";
import {
  RequestUploadUrlSchema,
  CreateNoteSchema,
  UpdateMaterialSchema,
  resolveMaterialType,
  MAX_FILE_SIZES,
} from "../material.schema";

describe("Material Schemas & Utilities", () => {
  const validUuid = "123e4567-e89b-12d3-a456-426614174000";

  describe("resolveMaterialType", () => {
    it("debe resolver PDF correctamente", () => {
      expect(resolveMaterialType("application/pdf")).toBe("PDF");
      expect(resolveMaterialType("application/octet-stream", "documento.pdf")).toBe(
        "PDF"
      );
    });

    it("debe resolver PPTX correctamente", () => {
      expect(
        resolveMaterialType(
          "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        )
      ).toBe("PPTX");
      expect(resolveMaterialType("application/octet-stream", "clase.pptx")).toBe(
        "PPTX"
      );
    });

    it("debe resolver AUDIO correctamente", () => {
      expect(resolveMaterialType("audio/mpeg")).toBe("AUDIO");
      expect(resolveMaterialType("audio/mp3")).toBe("AUDIO");
      expect(resolveMaterialType("audio/wav")).toBe("AUDIO");
      expect(resolveMaterialType("application/octet-stream", "grabacion.m4a")).toBe(
        "AUDIO"
      );
    });

    it("debe resolver IMAGE correctamente", () => {
      expect(resolveMaterialType("image/png")).toBe("IMAGE");
      expect(resolveMaterialType("image/jpeg")).toBe("IMAGE");
      expect(resolveMaterialType("application/octet-stream", "foto.webp")).toBe(
        "IMAGE"
      );
    });

    it("debe resolver NOTE correctamente", () => {
      expect(resolveMaterialType("text/plain")).toBe("NOTE");
      expect(resolveMaterialType("text/markdown")).toBe("NOTE");
      expect(resolveMaterialType("application/octet-stream", "apuntes.md")).toBe(
        "NOTE"
      );
    });

    it("debe retornar null para formatos no admitidos", () => {
      expect(resolveMaterialType("application/x-msdownload", "virus.exe")).toBeNull();
      expect(resolveMaterialType("video/mp4", "pelicula.mp4")).toBeNull();
    });
  });

  describe("RequestUploadUrlSchema", () => {
    it("debe validar una solicitud de subida de PDF válida", () => {
      const result = RequestUploadUrlSchema.safeParse({
        courseId: validUuid,
        filename: "resumen_unidad_1.pdf",
        fileSize: 5 * 1024 * 1024, // 5MB
        mimeType: "application/pdf",
      });

      expect(result.success).toBe(true);
    });

    it("debe rechazar un archivo que excede el tamaño máximo permitido", () => {
      const result = RequestUploadUrlSchema.safeParse({
        courseId: validUuid,
        filename: "libro_pesado.pdf",
        fileSize: 30 * 1024 * 1024, // 30MB > 25MB
        mimeType: "application/pdf",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "El archivo supera el tamaño máximo permitido"
        );
      }
    });

    it("debe rechazar tipos MIME no permitidos", () => {
      const result = RequestUploadUrlSchema.safeParse({
        courseId: validUuid,
        filename: "script.sh",
        fileSize: 1024,
        mimeType: "application/x-sh",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("CreateNoteSchema", () => {
    it("debe validar una nota correcta", () => {
      const result = CreateNoteSchema.safeParse({
        courseId: validUuid,
        title: "Apuntes Clase 3",
        content: "Conceptos clave sobre memoria virtual y paginación.",
      });

      expect(result.success).toBe(true);
    });

    it("debe rechazar notas con título demasiado corto", () => {
      const result = CreateNoteSchema.safeParse({
        courseId: validUuid,
        title: "A",
        content: "Contenido válido suficiente para la prueba.",
      });

      expect(result.success).toBe(false);
    });

    it("debe rechazar notas con contenido vacío", () => {
      const result = CreateNoteSchema.safeParse({
        courseId: validUuid,
        title: "Título Válido",
        content: "   ",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("UpdateMaterialSchema", () => {
    it("debe permitir actualización de título y descripción", () => {
      const result = UpdateMaterialSchema.safeParse({
        title: "Nuevo Título",
        description: "Nueva descripción actualizada",
      });

      expect(result.success).toBe(true);
    });
  });
});
