import { BookOpen, Clock, Sparkles } from "lucide-react";
import { authService } from "@/services/auth/auth.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/EmptyState";

export default async function DashboardPage() {
  const session = await authService.getCurrentSession();
  const studentName = session?.profile?.fullName?.split(" ")[0] ?? "Estudiante";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Hola, {studentName}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Panel de estudio y seguimiento de materias universitarias
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:border-white/[0.18] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Materias activas
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.05] border border-white/[0.08] text-zinc-300">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-white/95">0</div>
            <p className="text-xs text-zinc-400 mt-1">
              Materias registradas este cuatrimestre
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-white/[0.18] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Revisiones pendientes
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.05] border border-white/[0.08] text-zinc-300">
              <Clock className="h-4 w-4 text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-white/95">0</div>
            <p className="text-xs text-zinc-400 mt-1">
              Temas recomendados para repasar hoy
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-white/[0.18] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Dominio global estimado
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.05] border border-white/[0.08] text-zinc-300">
              <Sparkles className="h-4 w-4 text-sky-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-white/95">--%</div>
            <p className="text-xs text-zinc-400 mt-1">
              Basado en sesiones de active recall
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Section */}
      <div className="space-y-4 pt-2">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Actividad reciente
        </h2>
        <EmptyState
          icon={BookOpen}
          title="Sin materias registradas aún"
          description="En la siguiente etapa podrás subir programas, apuntes y PDFs para generar sesiones de active recall por materia."
        />
      </div>
    </div>
  );
}
