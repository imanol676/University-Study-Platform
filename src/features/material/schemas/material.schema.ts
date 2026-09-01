import { z } from "zod";
import { MaterialType } from "@/types/material";

export const ALLOWED_MIME_TYPES = {
  PDF: ["application/pdf"],
  PPTX: [
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
  AUDIO: [
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/m4a",
    "audio/x-m4a",
    "audio/ogg",
    "audio/webm",
  ],
  IMAGE: ["image/png", "image/jpeg", "image/webp"],
  NOTE: ["text/plain", "text/markdown"],
} as const;

export const MAX_FILE_SIZES: Record<MaterialType, number> = {
  PDF: 25 * 1024 * 1024, // 25 MB
  PPTX: 25 * 1024 * 1024, // 25 MB
  AUDIO: 50 * 1024 * 1024, // 50 MB
  IMAGE: 10 * 1024 * 1024, // 10 MB
  NOTE: 2 * 1024 * 1024, // 2 MB
};

export function resolveMaterialType(
  mimeType: string,
  filename?: string
): MaterialType | null {
  const normalizedMime = mimeType.toLowerCase();

  if (ALLOWED_MIME_TYPES.PDF.includes(normalizedMime as "application/pdf")) {
    return "PDF";
  }

  if (
    ALLOWED_MIME_TYPES.PPTX.includes(
      normalizedMime as (typeof ALLOWED_MIME_TYPES.PPTX)[number]
    )
  ) {
    return "PPTX";
  }

  if (
    ALLOWED_MIME_TYPES.AUDIO.includes(
      normalizedMime as (typeof ALLOWED_MIME_TYPES.AUDIO)[number]
    )
  ) {
    return "AUDIO";
  }

  if (
    ALLOWED_MIME_TYPES.IMAGE.includes(
      normalizedMime as (typeof ALLOWED_MIME_TYPES.IMAGE)[number]
    )
  ) {
    return "IMAGE";
  }

  if (
    ALLOWED_MIME_TYPES.NOTE.includes(
      normalizedMime as (typeof ALLOWED_MIME_TYPES.NOTE)[number]
    )
  ) {
    return "NOTE";
  }

  // Fallback por extensión de archivo si el MIME del navegador es genérico (ej. application/octet-stream)
  if (filename) {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "PDF";
    if (ext === "ppt" || ext === "pptx") return "PPTX";
    if (["mp3", "wav", "m4a", "ogg", "webm"].includes(ext ?? "")) return "AUDIO";
    if (["png", "jpg", "jpeg", "webp"].includes(ext ?? "")) return "IMAGE";
    if (["txt", "md"].includes(ext ?? "")) return "NOTE";
  }

  return null;
}

export const RequestUploadUrlSchema = z
  .object({
    courseId: z.string().uuid("ID de materia inválido"),
    filename: z
      .string()
      .trim()
      .min(1, "El nombre del archivo es obligatorio")
      .max(200, "El nombre no puede exceder 200 caracteres"),
    fileSize: z
      .number()
      .int()
      .positive("El archivo no puede estar vacío"),
    mimeType: z
      .string()
      .min(1, "El tipo MIME es obligatorio"),
    description: z
      .string()
      .trim()
      .max(500, "La descripción no puede superar 500 caracteres")
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      const detectedType = resolveMaterialType(data.mimeType, data.filename);
      return detectedType !== null;
    },
    {
      message:
        "Formato de archivo no admitido. Se admiten PDF, PPT/PPTX, Audio (MP3/WAV/M4A), Imágenes (PNG/JPG/WEBP) y Notas.",
      path: ["mimeType"],
    }
  )
  .refine(
    (data) => {
      const detectedType = resolveMaterialType(data.mimeType, data.filename);
      if (!detectedType) return false;
      const maxSize = MAX_FILE_SIZES[detectedType];
      return data.fileSize <= maxSize;
    },
    {
      message: "El archivo supera el tamaño máximo permitido para este formato.",
      path: ["fileSize"],
    }
  );

export const ConfirmUploadSchema = z.object({
  materialId: z.string().uuid("ID de material inválido"),
});

export const CreateNoteSchema = z.object({
  courseId: z.string().uuid("ID de materia inválido"),
  title: z
    .string()
    .trim()
    .min(2, "El título debe tener al menos 2 caracteres")
    .max(200, "El título no puede exceder 200 caracteres"),
  content: z
    .string()
    .trim()
    .min(5, "El contenido de la nota debe tener al menos 5 caracteres")
    .max(50000, "El contenido no puede superar los 50.000 caracteres"),
  description: z
    .string()
    .trim()
    .max(500, "La descripción no puede superar 500 caracteres")
    .optional()
    .nullable(),
});

export const UpdateMaterialSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "El título debe tener al menos 2 caracteres")
    .max(200, "El título no puede superar 200 caracteres")
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, "La descripción no puede superar 500 caracteres")
    .optional()
    .nullable(),
  textContent: z
    .string()
    .trim()
    .min(5, "La nota debe tener al menos 5 caracteres")
    .max(50000)
    .optional(),
});

export type RequestUploadUrlInput = z.infer<typeof RequestUploadUrlSchema>;
export type ConfirmUploadInput = z.infer<typeof ConfirmUploadSchema>;
export type CreateNoteInput = z.infer<typeof CreateNoteSchema>;
export type UpdateMaterialInput = z.infer<typeof UpdateMaterialSchema>;
