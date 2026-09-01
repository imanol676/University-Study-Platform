"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMaterialsAction,
  requestUploadUrlAction,
  confirmUploadAction,
  createNoteAction,
  updateMaterialAction,
  deleteMaterialAction,
  getMaterialDownloadUrlAction,
} from "@/features/material/actions/material.actions";
import {
  CreateNoteInput,
  RequestUploadUrlInput,
  UpdateMaterialInput,
} from "@/features/material/schemas/material.schema";
import { Material, MaterialType } from "@/types/material";

export function useMaterials(courseId: string, type?: MaterialType) {
  return useQuery<Material[]>({
    queryKey: ["materials", courseId, { type }],
    queryFn: async () => {
      if (!courseId) return [];
      const result = await getMaterialsAction(courseId, type);
      if (!result.success || !result.data) {
        throw new Error(result.error ?? "No se pudieron obtener los materiales");
      }
      return result.data;
    },
    enabled: !!courseId,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

export function useCreateNote(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateNoteInput) => {
      const result = await createNoteAction(data);
      if (!result.success || !result.data) {
        throw new Error(result.error ?? "No se pudo crear la nota");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials", courseId] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useUpdateMaterial(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      materialId,
      data,
    }: {
      materialId: string;
      data: UpdateMaterialInput;
    }) => {
      const result = await updateMaterialAction(materialId, data);
      if (!result.success || !result.data) {
        throw new Error(result.error ?? "No se pudo actualizar el material");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials", courseId] });
    },
  });
}

export function useDeleteMaterial(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (materialId: string) => {
      const result = await deleteMaterialAction(materialId);
      if (!result.success) {
        throw new Error(result.error ?? "No se pudo eliminar el material");
      }
      return materialId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials", courseId] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

/**
 * Función auxiliar para subir un archivo binario directamente a Cloudflare R2
 * mediante HTTP PUT con seguimiento de progreso real (0 a 100%).
 */
export function uploadBinaryToPresignedUrl(
  uploadUrl: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(
          new Error(
            `Error en la carga hacia el almacenamiento (HTTP ${xhr.status})`
          )
        );
      }
    };

    xhr.onerror = () => {
      reject(new Error("Error de conexión al subir el archivo al almacenamiento"));
    };

    xhr.onabort = () => {
      reject(new Error("La subida fue cancelada"));
    };

    xhr.send(file);
  });
}

/**
 * Hook compuesto para orquestar la subida completa:
 * 1. Pedir Presigned URL al servidor
 * 2. Subir binario a R2 con progreso
 * 3. Confirmar subida al servidor
 */
export function useUploadMaterial(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      description,
      onProgress,
    }: {
      file: File;
      description?: string;
      onProgress?: (progress: number) => void;
    }) => {
      // 1. Solicitar URL prefirmada
      const reqResult = await requestUploadUrlAction({
        courseId,
        filename: file.name,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
        description,
      });

      if (!reqResult.success || !reqResult.data) {
        throw new Error(
          reqResult.error ?? "No se pudo obtener la autorización de subida"
        );
      }

      const { materialId, uploadUrl } = reqResult.data;

      // 2. Subir binario directamente a R2
      await uploadBinaryToPresignedUrl(uploadUrl, file, onProgress);

      // 3. Confirmar subida en el servidor
      const confResult = await confirmUploadAction({ materialId });
      if (!confResult.success || !confResult.data) {
        throw new Error(
          confResult.error ?? "Error al registrar la finalización del archivo"
        );
      }

      return confResult.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials", courseId] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export async function fetchMaterialDownloadUrl(
  materialId: string
): Promise<string> {
  const result = await getMaterialDownloadUrlAction(materialId);
  if (!result.success || !result.data) {
    throw new Error(result.error ?? "No se pudo obtener el enlace de descarga");
  }
  return result.data;
}
