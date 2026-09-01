"use client";

import { FileText, Sparkles, BarChart2, Settings, UploadCloud, BrainCircuit } from "lucide-react";
import { Course } from "@/types/course";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";

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
  return (
    <Tabs defaultValue="documents" className="w-full space-y-6">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-2xl h-auto p-1.5 gap-1.5">
        <TabsTrigger value="documents" className="h-9 py-2 px-3 text-xs sm:text-sm">
          <FileText className="mr-1.5 h-4 w-4 shrink-0" />
          Documentos
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

      {/* Tab 1: Documentos (Placeholder SPEC-003) */}
      <TabsContent value="documents" className="space-y-4">
        <EmptyState
          icon={UploadCloud}
          title="Sin documentos en esta materia"
          description="En SPEC-003 podrás subir programas de estudio, PDFs, notas y grabaciones para generar el contexto RAG de esta materia."
        />
      </TabsContent>

      {/* Tab 2: Active Recall (Placeholder SPEC-004) */}
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
              <div className="text-2xl font-bold text-white/95">0</div>
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
