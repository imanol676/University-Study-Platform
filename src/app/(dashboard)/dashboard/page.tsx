import Link from "next/link";
import { BookOpen, Clock, Sparkles, ArrowRight, Plus } from "lucide-react";
import { authService } from "@/services/auth/auth.service";
import { courseService } from "@/services/course/course.service";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { CourseCard } from "@/components/courses/CourseCard";

export default async function DashboardPage() {
  const session = await authService.getCurrentSession();
  const studentName = session?.profile?.fullName?.split(" ")[0] ?? "Estudiante";

  const activeCourseCount = session
    ? await courseService.getActiveCourseCount(session.user.id)
    : 0;

  const recentCourses = session
    ? (await courseService.getCourses(session.user.id)).slice(0, 3)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white/95">
            Hola, {studentName}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Panel de estudio y seguimiento de materias universitarias
          </p>
        </div>

        <Button asChild className="shrink-0 shadow-lg shadow-primary/20">
          <Link href="/courses">
            <Plus className="mr-1.5 h-4 w-4" />
            Nueva materia
          </Link>
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:border-white/[0.18] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Materias activas
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 border border-primary/25 text-primary">
              <BookOpen className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-white/95">
              {activeCourseCount}
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              {activeCourseCount === 1
                ? "1 materia registrada"
                : `${activeCourseCount} materias registradas`}
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

      {/* Recent Courses Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-white/95">
            Tus materias
          </h2>
          {recentCourses.length > 0 && (
            <Button variant="ghost" size="sm" asChild className="text-xs text-primary hover:text-primary">
              <Link href="/courses">
                Ver todas ({activeCourseCount})
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>

        {recentCourses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Aún no tienes materias registradas"
            description="Crea tu primera materia para comenzar a organizar tus documentos, notas y sesiones de active recall."
            actionLabel="Crear mi primera materia"
            actionHref="/courses"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
