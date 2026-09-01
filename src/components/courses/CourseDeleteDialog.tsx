"use client";

import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";
import { Course } from "@/types/course";
import { useDeleteCourse } from "@/features/course/hooks/use-courses";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CourseDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course | null;
  onSuccess?: () => void;
}

export function CourseDeleteDialog({
  open,
  onOpenChange,
  course,
  onSuccess,
}: CourseDeleteDialogProps) {
  const deleteMutation = useDeleteCourse();

  if (!course) return null;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(course.id);
      toast.success(`Materia "${course.name}" eliminada`);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al eliminar la materia"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/15 text-destructive border border-destructive/25 shadow-[0_0_20px_rgba(239,68,68,0.2)] mb-2">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center">
            ¿Eliminar {course.name}?
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-400">
            Esta acción eliminará de forma permanente la materia y todos sus
            documentos y sesiones de estudio asociadas. Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-3 sm:space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="w-full sm:w-auto"
          >
            {deleteMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Eliminar definitivamente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
