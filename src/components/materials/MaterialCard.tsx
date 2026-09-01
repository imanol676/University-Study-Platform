"use client";

import React, { useState } from "react";
import { Material } from "@/types/material";
import { MaterialTypeBadge } from "./MaterialTypeBadge";
import { Button } from "@/components/ui/button";
import {
  Download,
  Trash2,
  Calendar,
  HardDrive,
  ExternalLink,
  Loader2,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { fetchMaterialDownloadUrl } from "@/features/material/hooks/use-materials";

interface MaterialCardProps {
  material: Material;
  onDelete: (material: Material) => void;
  onViewNote?: (material: Material) => void;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function MaterialCard({
  material,
  onDelete,
  onViewNote,
}: MaterialCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const formattedDate = new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(material.createdAt));

  const handleDownloadOrOpen = async () => {
    if (material.type === "NOTE" && onViewNote) {
      onViewNote(material);
      return;
    }

    try {
      setIsDownloading(true);
      const url = await fetchMaterialDownloadUrl(material.id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al abrir el documento"
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-200">
      {/* Información del archivo */}
      <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] border border-white/[0.1] text-zinc-300 group-hover:scale-105 transition-transform">
          <MaterialTypeBadge type={material.type} showLabel={false} />
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4
              className="text-sm font-semibold text-white/95 truncate group-hover:text-primary transition-colors cursor-pointer"
              onClick={handleDownloadOrOpen}
              title={material.title}
            >
              {material.title}
            </h4>
            <MaterialTypeBadge type={material.type} />
          </div>

          {material.description && (
            <p className="text-xs text-zinc-400 truncate mt-0.5">
              {material.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-zinc-500 font-medium">
            <span className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              {formatBytes(material.fileSize)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formattedDate}
            </span>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadOrOpen}
          disabled={isDownloading}
          className="h-8 px-3 text-xs bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08]"
        >
          {isDownloading ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : material.type === "NOTE" ? (
            <FileText className="mr-1.5 h-3.5 w-3.5 text-sky-400" />
          ) : (
            <Download className="mr-1.5 h-3.5 w-3.5 text-zinc-300" />
          )}
          {material.type === "NOTE" ? "Ver nota" : "Descargar"}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(material)}
          title="Eliminar material"
          className="h-8 w-8 text-zinc-400 hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
