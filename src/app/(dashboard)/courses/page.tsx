import { BookOpen } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Materias
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestión de contextos académicos y documentos por asignatura
        </p>
      </div>

      <EmptyState
        icon={BookOpen}
        title="Gestión de materias disponible próximamente"
        description="Esta funcionalidad se implementará en SPEC-002: Gestión de Documentos y Materias."
      />
    </div>
  );
}
