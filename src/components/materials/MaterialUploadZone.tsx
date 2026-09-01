"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileUp, StickyNote, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { resolveMaterialType, MAX_FILE_SIZES } from "@/features/material/schemas/material.schema";
import { formatBytes } from "./MaterialCard";

interface MaterialUploadZoneProps {
  onUploadFile: (file: File, onProgress: (percent: number) => void) => Promise<void>;
  onOpenNoteDialog: () => void;
  isUploading: boolean;
}

export function MaterialUploadZone({
  onUploadFile,
  onOpenNoteDialog,
  isUploading,
}: MaterialUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadingFilename, setUploadingFilename] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const detectedType = resolveMaterialType(file.type, file.name);
    if (!detectedType) {
      toast.error(
        "Formato no admitido. Se admiten PDF, PPTX, Audios (MP3/WAV/M4A), Imágenes (PNG/JPG/WEBP) y Notas."
      );
      return;
    }

    const maxSize = MAX_FILE_SIZES[detectedType];
    if (file.size > maxSize) {
      toast.error(
        `El archivo "${file.name}" supera el tamaño máximo de ${formatBytes(maxSize)} para este formato.`
      );
      return;
    }

    try {
      setUploadingFilename(file.name);
      setUploadProgress(0);
      await onUploadFile(file, (percent) => {
        setUploadProgress(percent);
      });
      toast.success(`"${file.name}" subido exitosamente`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al subir el archivo"
      );
    } finally {
      setUploadProgress(null);
      setUploadingFilename(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isUploading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Procesar el primer archivo
    await handleFile(files[0]);
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await handleFile(files[0]);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl border-2 border-dashed transition-all duration-300 text-center backdrop-blur-xl",
        isDragging
          ? "border-primary bg-primary/[0.08] shadow-[0_0_30px_rgba(99,102,241,0.2)] scale-[1.01]"
          : "border-white/[0.12] bg-white/[0.02] hover:border-white/[0.2] hover:bg-white/[0.04]"
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.ppt,.pptx,.mp3,.wav,.m4a,.ogg,.webm,.png,.jpg,.jpeg,.webp,.txt,.md,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,audio/*,image/*,text/plain,text/markdown"
        onChange={handleInputChange}
        disabled={isUploading}
      />

      {isUploading ? (
        <div className="w-full max-w-sm flex flex-col items-center space-y-3 py-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary border border-primary/25 animate-pulse">
            <UploadCloud className="h-6 w-6 animate-bounce" />
          </div>
          <div className="space-y-1 text-center">
            <h4 className="text-sm font-semibold text-white truncate max-w-xs">
              Subiendo {uploadingFilename || "archivo"}...
            </h4>
            <p className="text-xs text-zinc-400">
              Subida directa y segura a Cloudflare R2
            </p>
          </div>

          {/* Barra de progreso */}
          <div className="w-full space-y-1 pt-2">
            <div className="flex justify-between text-xs text-zinc-400 font-mono">
              <span>Progreso</span>
              <span className="text-primary font-semibold">
                {uploadProgress ?? 0}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className="h-full bg-gradient-to-r from-primary to-indigo-400 transition-all duration-200 rounded-full"
                style={{ width: `${uploadProgress ?? 0}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-3.5">
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 border",
              isDragging
                ? "bg-primary text-white scale-110 shadow-lg shadow-primary/30 border-primary"
                : "bg-white/[0.05] text-zinc-300 border-white/[0.1] shadow-inner"
            )}
          >
            <UploadCloud className="h-7 w-7" />
          </div>

          <div className="space-y-1">
            <h4 className="text-sm sm:text-base font-semibold text-white/95">
              Arrastrá tus documentos aquí o seleccionalos
            </h4>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Admite PDFs, Presentaciones PPTX (hasta 25MB), Audios de clase (hasta 50MB) e Imágenes (hasta 10MB)
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              variant="default"
              size="sm"
              className="h-9 px-4 font-semibold text-xs shadow-md shadow-primary/20"
            >
              <FileUp className="mr-2 h-4 w-4" />
              Seleccionar archivo
            </Button>

            <Button
              type="button"
              onClick={onOpenNoteDialog}
              variant="outline"
              size="sm"
              className="h-9 px-3.5 text-xs bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.1]"
            >
              <StickyNote className="mr-2 h-4 w-4 text-sky-400" />
              Redactar apunte
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
