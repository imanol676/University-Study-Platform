"use client";

import { useState, useMemo } from "react";
import { Plus, Search, BookOpen, Sparkles, Filter } from "lucide-react";
import { Course, CourseFilter } from "@/types/course";
import { useCourses, useArchiveCourse } from "@/features/course/hooks/use-courses";
import { CourseCard } from "@/components/courses/CourseCard";
import { CourseFormDialog } from "@/components/courses/CourseFormDialog";
import { CourseDeleteDialog } from "@/components/courses/CourseDeleteDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function CoursesPage() {
  const [filter, setFilter] = useState<CourseFilter>("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Fetch all courses including archived so client can filter instantaneously
  const { data: courses, isLoading, error } = useCourses({ includeArchived: true });
  const archiveMutation = useArchiveCourse();

  const filteredCourses = useMemo(() => {
    if (!courses) return [];

    return courses.filter((course) => {
      // Tab filter
      if (filter === "active" && course.isArchived) return false;
      if (filter === "archived" && !course.isArchived) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = course.name.toLowerCase().includes(query);
        const matchesCode = course.code?.toLowerCase().includes(query) ?? false;
        const matchesTerm = course.term?.toLowerCase().includes(query) ?? false;
        return matchesName || matchesCode || matchesTerm;
      }

      return true;
    });
  }, [courses, filter, searchQuery]);

  const handleEdit = (course: Course) => {
    setCourseToEdit(course);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setCourseToEdit(null);
    setIsFormOpen(true);
  };

  const handleDelete = (course: Course) => {
    setCourseToDelete(course);
    setIsDeleteOpen(true);
  };

  const handleArchiveToggle = async (course: Course) => {
    try {
      await archiveMutation.mutateAsync({
        id: course.id,
        isArchived: !course.isArchived,
      });
      toast.success(
        course.isArchived
          ? `Materia "${course.name}" desarchivada`
          : `Materia "${course.name}" archivada`
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al cambiar estado de la materia"
      );
    }
  };

  const activeCount = courses?.filter((c) => !c.isArchived).length ?? 0;
  const archivedCount = courses?.filter((c) => c.isArchived).length ?? 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white/95 flex items-center gap-2.5">
            Materias
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Organiza tus asignaturas, documentos y sesiones de estudio aisladas por materia
          </p>
        </div>

        <Button onClick={handleCreate} className="shrink-0 shadow-lg shadow-primary/20">
          <Plus className="mr-1.5 h-4 w-4" />
          Nueva materia
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <Input
            placeholder="Buscar por nombre, código o cuatrimestre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        {/* Tab Filters */}
        <Tabs
          value={filter}
          onValueChange={(val) => setFilter(val as CourseFilter)}
          className="shrink-0"
        >
          <TabsList className="h-10">
            <TabsTrigger value="active" className="text-xs">
              Activas ({isLoading ? "..." : activeCount})
            </TabsTrigger>
            <TabsTrigger value="archived" className="text-xs">
              Archivadas ({isLoading ? "..." : archivedCount})
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs">
              Todas ({isLoading ? "..." : (courses?.length ?? 0)})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={BookOpen}
          title="Error al cargar materias"
          description="Ocurrió un problema al consultar tus asignaturas. Por favor recarga la página."
        />
      ) : filteredCourses.length === 0 ? (
        searchQuery ? (
          <EmptyState
            icon={Search}
            title="Sin resultados"
            description={`No se encontraron materias que coincidan con "${searchQuery}".`}
          />
        ) : filter === "archived" ? (
          <EmptyState
            icon={BookOpen}
            title="No tienes materias archivadas"
            description="Las materias que archives para ocultarlas de tu panel activo aparecerán en esta sección."
          />
        ) : (
          <EmptyState
            icon={BookOpen}
            title="Aún no tienes materias registradas"
            description="Crea tu primera materia para comenzar a subir documentos y generar sesiones de active recall."
            actionLabel="Crear mi primera materia"
            onAction={handleCreate}
          />
        )
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onArchiveToggle={handleArchiveToggle}
            />
          ))}
        </div>
      )}

      {/* Form Modal (Create / Edit) */}
      <CourseFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        courseToEdit={courseToEdit}
      />

      {/* Delete Confirmation Modal */}
      <CourseDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        course={courseToDelete}
      />
    </div>
  );
}
