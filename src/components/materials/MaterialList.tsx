"use client";

import React, { useState, useMemo } from "react";
import { Material, MaterialType } from "@/types/material";
import { MaterialCard } from "./MaterialCard";
import { MaterialDeleteDialog } from "./MaterialDeleteDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Search,
  StickyNote,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MaterialListProps {
  materials: Material[];
  isLoading: boolean;
  onDeleteMaterial: (material: Material) => Promise<void>;
  isDeleting: boolean;
}

const filterOptions: { label: string; value: "ALL" | MaterialType }[] = [
  { label: "Todos", value: "ALL" },
  { label: "PDFs", value: "PDF" },
  { label: "Presentaciones", value: "PPTX" },
  { label: "Audios", value: "AUDIO" },
  { label: "Imágenes", value: "IMAGE" },
  { label: "Apuntes", value: "NOTE" },
];

export function MaterialList({
  materials,
  isLoading,
  onDeleteMaterial,
  isDeleting,
}: MaterialListProps) {
  const [selectedType, setSelectedType] = useState<"ALL" | MaterialType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingMaterial, setDeletingMaterial] = useState<Material | null>(null);
  const [viewingNote, setViewingNote] = useState<Material | null>(null);

  const filteredMaterials = useMemo(() => {
    return materials.filter((item) => {
      const matchesType =
        selectedType === "ALL" ? true : item.type === selectedType;

      const matchesSearch = searchQuery.trim()
        ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description &&
            item.description.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;

      return matchesType && matchesSearch;
    });
  }, [materials, selectedType, searchQuery]);

  const handleConfirmDelete = async (material: Material) => {
    await onDeleteMaterial(material);
    setDeletingMaterial(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 w-full animate-pulse rounded-2xl bg-white/[0.04] border border-white/[0.06]"
          />
        ))}
      </div>
    );
  }

  if (materials.length === 0) {
    return null; // La Dropzone superior ya actúa como prompt de carga
  }

  return (
    <div className="space-y-4 pt-2">
      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filtros por tipo de material */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">
          {filterOptions.map((opt) => {
            const isActive = selectedType === opt.value;
            const count =
              opt.value === "ALL"
                ? materials.length
                : materials.filter((m) => m.type === opt.value).length;

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedType(opt.value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                  isActive
                    ? "bg-white/[0.12] text-white shadow-sm border border-white/[0.12]"
                    : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                <span>{opt.label}</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                    isActive
                      ? "bg-primary/25 text-primary"
                      : "bg-white/[0.06] text-zinc-500"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Buscador de archivos */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <Input
            placeholder="Buscar materiales..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-xs bg-white/[0.03] border-white/[0.08]"
          />
        </div>
      </div>

      {/* Lista de Documentos */}
      {filteredMaterials.length === 0 ? (
        <div className="py-8">
          <EmptyState
            icon={FileText}
            title="No se encontraron materiales"
            description={
              searchQuery
                ? `No hay resultados para "${searchQuery}". Probá cambiando el término de búsqueda.`
                : "No hay materiales registrados bajo este tipo de archivo."
            }
          />
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredMaterials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              onDelete={(mat) => setDeletingMaterial(mat)}
              onViewNote={(mat) => setViewingNote(mat)}
            />
          ))}
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      <MaterialDeleteDialog
        material={deletingMaterial}
        open={!!deletingMaterial}
        onOpenChange={(open) => !open && setDeletingMaterial(null)}
        onConfirm={handleConfirmDelete}
        isPending={isDeleting}
      />

      {/* Modal de Visualización de Nota / Apunte */}
      <Dialog
        open={!!viewingNote}
        onOpenChange={(open) => !open && setViewingNote(null)}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <StickyNote className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle>{viewingNote?.title}</DialogTitle>
                <DialogDescription>
                  Apunte registrado para esta materia
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto rounded-xl p-4 bg-white/[0.02] border border-white/[0.08] text-sm text-zinc-200 whitespace-pre-wrap font-sans leading-relaxed my-2">
            {viewingNote?.textContent || "Sin contenido de texto registrado."}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
