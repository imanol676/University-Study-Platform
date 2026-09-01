"use server";

import { revalidatePath } from "next/cache";
import { authService } from "@/services/auth/auth.service";
import { materialService } from "@/services/material/material.service";
import {
  RequestUploadUrlSchema,
  ConfirmUploadSchema,
  CreateNoteSchema,
  UpdateMaterialSchema,
  RequestUploadUrlInput,
  ConfirmUploadInput,
  CreateNoteInput,
  UpdateMaterialInput,
} from "@/features/material/schemas/material.schema";
import {
  Material,
  MaterialType,
  PresignedUploadResult,
} from "@/types/material";

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function requestUploadUrlAction(
  rawInput: RequestUploadUrlInput
): Promise<ActionResult<PresignedUploadResult>> {
  try {
    const session = await authService.getCurrentSession();
    if (!session) {
      return { success: false, error: "No autenticado" };
    }

    const validated = RequestUploadUrlSchema.safeParse(rawInput);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message ?? "Datos de archivo inválidos",
      };
    }

    const result = await materialService.requestUploadUrl(
      session.user.id,
      validated.data
    );

    return { success: true, data: result };
  } catch (error) {
    console.error("requestUploadUrlAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al solicitar la URL de subida",
    };
  }
}

export async function confirmUploadAction(
  rawInput: ConfirmUploadInput
): Promise<ActionResult<Material>> {
  try {
    const session = await authService.getCurrentSession();
    if (!session) {
      return { success: false, error: "No autenticado" };
    }

    const validated = ConfirmUploadSchema.safeParse(rawInput);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message ?? "ID de material inválido",
      };
    }

    const material = await materialService.confirmUpload(
      session.user.id,
      validated.data.materialId
    );

    revalidatePath(`/courses/${material.courseId}`);
    return { success: true, data: material };
  } catch (error) {
    console.error("confirmUploadAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al confirmar la subida del material",
    };
  }
}

export async function createNoteAction(
  rawInput: CreateNoteInput
): Promise<ActionResult<Material>> {
  try {
    const session = await authService.getCurrentSession();
    if (!session) {
      return { success: false, error: "No autenticado" };
    }

    const validated = CreateNoteSchema.safeParse(rawInput);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message ?? "Datos de la nota inválidos",
      };
    }

    const material = await materialService.createNote(
      session.user.id,
      validated.data
    );

    revalidatePath(`/courses/${material.courseId}`);
    return { success: true, data: material };
  } catch (error) {
    console.error("createNoteAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al guardar la nota",
    };
  }
}

export async function getMaterialsAction(
  courseId: string,
  type?: MaterialType
): Promise<ActionResult<Material[]>> {
  try {
    const session = await authService.getCurrentSession();
    if (!session) {
      return { success: false, error: "No autenticado" };
    }

    const materials = await materialService.getMaterialsByCourse(
      session.user.id,
      courseId,
      type
    );

    return { success: true, data: materials };
  } catch (error) {
    console.error("getMaterialsAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al obtener los materiales",
    };
  }
}

export async function getMaterialDownloadUrlAction(
  materialId: string
): Promise<ActionResult<string>> {
  try {
    const session = await authService.getCurrentSession();
    if (!session) {
      return { success: false, error: "No autenticado" };
    }

    const url = await materialService.getDownloadUrl(
      session.user.id,
      materialId
    );

    return { success: true, data: url };
  } catch (error) {
    console.error("getMaterialDownloadUrlAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al generar el enlace de descarga",
    };
  }
}

export async function updateMaterialAction(
  materialId: string,
  rawInput: UpdateMaterialInput
): Promise<ActionResult<Material>> {
  try {
    const session = await authService.getCurrentSession();
    if (!session) {
      return { success: false, error: "No autenticado" };
    }

    const validated = UpdateMaterialSchema.safeParse(rawInput);
    if (!validated.success) {
      return {
        success: false,
        error:
          validated.error.issues[0]?.message ?? "Datos de actualización inválidos",
      };
    }

    const updated = await materialService.updateMaterial(
      session.user.id,
      materialId,
      validated.data
    );

    revalidatePath(`/courses/${updated.courseId}`);
    return { success: true, data: updated };
  } catch (error) {
    console.error("updateMaterialAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al actualizar el material",
    };
  }
}

export async function deleteMaterialAction(
  materialId: string
): Promise<ActionResult<void>> {
  try {
    const session = await authService.getCurrentSession();
    if (!session) {
      return { success: false, error: "No autenticado" };
    }

    await materialService.deleteMaterial(session.user.id, materialId);

    return { success: true };
  } catch (error) {
    console.error("deleteMaterialAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al eliminar el material",
    };
  }
}
