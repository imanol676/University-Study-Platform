"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Course } from "@/types/course";
import { useArchiveCourse } from "@/features/course/hooks/use-courses";
import { CourseHeader } from "@/components/courses/CourseHeader";
import { CourseTabs } from "@/components/courses/CourseTabs";
import { CourseFormDialog } from "@/components/courses/CourseFormDialog";
import { CourseDeleteDialog } from "@/components/courses/CourseDeleteDialog";

interface CourseDetailViewProps {
  initialCourse: Course;
}

export function CourseDetailView({ initialCourse }: CourseDetailViewProps) {
  const router = useRouter();
  const [course, setCourse] = useState<Course>(initialCourse);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const archiveMutation = useArchiveCourse();

  const handleEditSuccess = (updated: Course) => {
    setCourse(updated);
    router.refresh();
  };

  const handleDeleteSuccess = () => {
    router.push("/courses");
  };

  const handleArchiveToggle = async () => {
    try {
      const updated = await archiveMutation.mutateAsync({
        id: course.id,
        isArchived: !course.isArchived,
      });
      setCourse(updated);
      toast.success(
        updated.isArchived
          ? `Materia "${updated.name}" archivada`
          : `Materia "${updated.name}" desarchivada`
      );
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al cambiar estado de la materia"
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <CourseHeader
        course={course}
        onEdit={() => setIsEditOpen(true)}
        onArchiveToggle={handleArchiveToggle}
        onDelete={() => setIsDeleteOpen(true)}
      />

      {/* Tabs */}
      <CourseTabs
        course={course}
        onEdit={() => setIsEditOpen(true)}
        onArchiveToggle={handleArchiveToggle}
        onDelete={() => setIsDeleteOpen(true)}
      />

      {/* Edit Dialog */}
      <CourseFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        courseToEdit={course}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Dialog */}
      <CourseDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        course={course}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
