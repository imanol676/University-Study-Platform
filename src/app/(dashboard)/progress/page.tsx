import { BarChart2 } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Progreso y Dominio
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Estimaciones de dominio académico y preparación para exámenes
        </p>
      </div>

      <EmptyState
        icon={BarChart2}
        title="Métricas de progreso en desarrollo"
        description="Aquí verás tu continuidad de estudio, temas débiles detectados y nivel estimado de preparación."
      />
    </div>
  );
}
