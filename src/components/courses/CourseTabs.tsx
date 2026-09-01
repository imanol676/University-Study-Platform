"use client";

import { useState } from "react";
import {
  FileText,
  Sparkles,
  BarChart2,
  Settings,
  BrainCircuit,
} from "lucide-react";
import { Course } from "@/types/course";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import {
  useMaterials,
  useUploadMaterial,
  useCreateNote,
  useDeleteMaterial,
} from "@/features/material/hooks/use-materials";
import { MaterialUploadZone } from "@/components/materials/MaterialUploadZone";
import { MaterialList } from "@/components/materials/MaterialList";
import { NoteEditorDialog } from "@/components/materials/NoteEditorDialog";
import { Material } from "@/types/material";
import { CreateNoteInput } from "@/features/material/schemas/material.schema";
import { toast } from "sonner";

interface CourseTabsProps {
  course: Course;
  onEdit: () => void;
  onArchiveToggle: () => void;
  onDelete: () => void;
}

export function CourseTabs({
  course,
  onEdit,
  onArchiveToggle,
  onDelete,
}: CourseTabsProps) {
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);

  const { data: materials = [], isLoading } = useMaterials(course.id);
  const uploadMutation = useUploadMaterial(course.id);
  const createNoteMutation = useCreateNote(course.id);
  const deleteMutation = useDeleteMaterial(course.id);

  const handleUploadFile = async (
    file: File,
    onProgress: (percent: number) => void
  ) => {
    await uploadMutation.mutateAsync({
      file,
      onProgress,
    });
  };

  const handleCreateNote = async (data: CreateNoteInput) => {
    await createNoteMutation.mutateAsync(data);
  };

  const handleDeleteMaterial = async (material: Material) => {
    try {
      await deleteMutation.mutateAsync(material.id);
      toast.success(`"${material.title}" eliminado`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al eliminar el material"
      );
    }
  };

  return (
    <Tabs defaultValue="documents" className="w-full space-y-6">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-2xl h-auto p-1.5 gap-1.5">
        <TabsTrigger value="documents" className="h-9 py-2 px-3 text-xs sm:text-sm">
          <FileText className="mr-1.5 h-4 w-4 shrink-0" />
          Documentos
          {materials.length > 0 && (
            <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.08] text-zinc-300 font-mono">
              {materials.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="recall" className="h-9 py-2 px-3 text-xs sm:text-sm">
          <Sparkles className="mr-1.5 h-4 w-4 shrink-0" />
          Active Recall
        </TabsTrigger>
        <TabsTrigger value="progress" className="h-9 py-2 px-3 text-xs sm:text-sm">
          <BarChart2 className="mr-1.5 h-4 w-4 shrink-0" />
          Dominio
        </TabsTrigger>
        <TabsTrigger value="settings" className="h-9 py-2 px-3 text-xs sm:text-sm">
          <Settings className="mr-1.5 h-4 w-4 shrink-0" />
          Ajustes
        </TabsTrigger>
      </TabsList>

      {/* Tab 1: Documentos & Materiales (SPEC-003) */}
      <TabsContent value="documents" className="space-y-6">
        {/* Zona Dropzone */}
        <MaterialUploadZone
          onUploadFile={handleUploadFile}
          onOpenNoteDialog={() => setIsNoteDialogOpen(true)}
          isUploading={uploadMutation.isPending}
        />

        {/* Listado de Materiales con Filtros */}
        <MaterialList
          materials={materials}
          isLoading={isLoading}
          onDeleteMaterial={handleDeleteMaterial}
          isDeleting={deleteMutation.isPending}
        />

        {/* Modal de Creación de Apuntes */}
        <NoteEditorDialog
          courseId={course.id}
          open={isNoteDialogOpen}
          onOpenChange={setIsNoteDialogOpen}
          onSubmitNote={handleCreateNote}
          isPending={createNoteMutation.isPending}
        />
      </TabsContent>

      {/* Tab 2: Active Recall (Placeholder SPEC-004/005) */}
      <TabsContent value="recall" className="space-y-4">
        <EmptyState
          icon={BrainCircuit}
          title="Sesiones de Active Recall"
          description="Una vez que subas materiales, la IA generará preguntas de active recall por voz y texto adaptadas a tu nivel de dominio."
        />
      </TabsContent>

      {/* Tab 3: Dominio / Progreso */}
      <TabsContent value="progress" className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-zinc-400">
                Dominio estimado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white/95">--%</div>
              <p className="text-xs text-zinc-500 mt-1">
                Requiere sesiones de active recall
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-zinc-400">
                Documentos procesados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white/95">
                {materials.length}
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Archivos vinculados a la materia
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-zinc-400">
                Sesiones completadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white/95">0</div>
              <p className="text-xs text-zinc-500 mt-1">
                Prácticas de repaso realizadas
              </p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Tab 4: Ajustes de Materia */}
      <TabsContent value="settings" className="space-y-4">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white/95">
              Detalles de la Materia
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Información académica y parámetros de configuración
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-white/[0.08]">
              <div>
                <span className="text-xs text-zinc-500 block">Nombre</span>
                <span className="font-medium text-white/90">{course.name}</span>
              </div>
              <div>
                <span className="text-xs text-zinc-500 block">Código / Cátedra</span>
                <span className="font-medium text-white/90">
                  {course.code || "No asignado"}
                </span>
              </div>
              <div>
                <span className="text-xs text-zinc-500 block">Período</span>
                <span className="font-medium text-white/90">
                  {course.term || "No especificado"}
                </span>
              </div>
              <div>
                <span className="text-xs text-zinc-500 block">Estado</span>
                <span className="font-medium text-white/90">
                  {course.isArchived ? "Archivada" : "Activa"}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button onClick={onEdit} variant="outline" size="sm">
                Editar información
              </Button>
              <Button onClick={onArchiveToggle} variant="outline" size="sm">
                {course.isArchived ? "Desarchivar materia" : "Archivar materia"}
              </Button>
              <Button
                onClick={onDelete}
                variant="destructive"
                size="sm"
                className="sm:ml-auto"
              >
                Eliminar materia
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
