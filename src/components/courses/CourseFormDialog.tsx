"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";
import { Course, CourseColor } from "@/types/course";
import {
  CreateCourseSchema,
  CreateCourseInput,
} from "@/features/course/schemas/course.schema";
import {
  useCreateCourse,
  useUpdateCourse,
} from "@/features/course/hooks/use-courses";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface CourseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseToEdit?: Course | null;
  onSuccess?: (course: Course) => void;
}

const colorOptions: { value: CourseColor; label: string; bgClass: string; ringClass: string }[] = [
  { value: "INDIGO", label: "Índigo", bgClass: "bg-indigo-500", ringClass: "ring-indigo-400" },
  { value: "BLUE", label: "Azul", bgClass: "bg-blue-500", ringClass: "ring-blue-400" },
  { value: "EMERALD", label: "Esmeralda", bgClass: "bg-emerald-500", ringClass: "ring-emerald-400" },
  { value: "AMBER", label: "Ámbar", bgClass: "bg-amber-500", ringClass: "ring-amber-400" },
  { value: "ROSE", label: "Rosa", bgClass: "bg-rose-500", ringClass: "ring-rose-400" },
  { value: "PURPLE", label: "Púrpura", bgClass: "bg-purple-500", ringClass: "ring-purple-400" },
  { value: "SLATE", label: "Pizarra", bgClass: "bg-slate-500", ringClass: "ring-slate-300" },
  { value: "CYAN", label: "Cian", bgClass: "bg-cyan-500", ringClass: "ring-cyan-400" },
];

export function CourseFormDialog({
  open,
  onOpenChange,
  courseToEdit,
  onSuccess,
}: CourseFormDialogProps) {
  const isEditing = !!courseToEdit;
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateCourseInput>({
    resolver: zodResolver(CreateCourseSchema),
    defaultValues: {
      name: "",
      code: "",
      term: "",
      description: "",
      color: "INDIGO",
    },
  });

  const selectedColor = watch("color");

  useEffect(() => {
    if (open) {
      if (courseToEdit) {
        reset({
          name: courseToEdit.name,
          code: courseToEdit.code ?? "",
          term: courseToEdit.term ?? "",
          description: courseToEdit.description ?? "",
          color: courseToEdit.color,
        });
      } else {
        reset({
          name: "",
          code: "",
          term: "",
          description: "",
          color: "INDIGO",
        });
      }
    }
  }, [open, courseToEdit, reset]);

  const onSubmit = async (data: CreateCourseInput) => {
    try {
      if (isEditing && courseToEdit) {
        const updated = await updateMutation.mutateAsync({
          id: courseToEdit.id,
          data,
        });
        toast.success("Materia actualizada correctamente");
        onOpenChange(false);
        onSuccess?.(updated);
      } else {
        const created = await createMutation.mutateAsync(data);
        toast.success("Materia creada correctamente");
        onOpenChange(false);
        onSuccess?.(created);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al guardar la materia"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar materia" : "Nueva materia"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modificá los datos o el color temático de la materia"
              : "Registrá una nueva asignatura para organizar tus materiales y sesiones de estudio"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Nombre */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold text-zinc-300">
              Nombre de la materia <span className="text-primary">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ej: Sistemas Operativos, Cálculo II"
              disabled={isPending}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Período y Código en 2 columnas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="term" className="text-xs font-semibold text-zinc-300">
                Período / Cuatrimestre <span className="text-zinc-500 font-normal">(Opcional)</span>
              </Label>
              <Input
                id="term"
                placeholder="Ej: 1er Cuatrimestre 2026"
                disabled={isPending}
                {...register("term")}
              />
              {errors.term && (
                <p className="text-xs text-destructive">{errors.term.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="code" className="text-xs font-semibold text-zinc-300">
                Código / Cátedra <span className="text-zinc-500 font-normal">(Opcional)</span>
              </Label>
              <Input
                id="code"
                placeholder="Ej: SO-101"
                disabled={isPending}
                {...register("code")}
              />
              {errors.code && (
                <p className="text-xs text-destructive">{errors.code.message}</p>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-semibold text-zinc-300">
              Descripción o notas <span className="text-zinc-500 font-normal">(Opcional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Objetivos de la materia, nombre del docente o temas principales..."
              rows={3}
              disabled={isPending}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Selector de Color */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-zinc-300">
              Acento visual de la materia
            </Label>
            <div className="flex flex-wrap gap-2.5 pt-1">
              {colorOptions.map((opt) => {
                const isSelected = selectedColor === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    title={opt.label}
                    onClick={() => setValue("color", opt.value)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-xl border border-white/20 transition-all duration-200 active:scale-95",
                      opt.bgClass,
                      isSelected
                        ? "ring-2 ring-offset-2 ring-offset-slate-950 scale-110 shadow-lg shadow-black/50"
                        : "opacity-75 hover:opacity-100"
                    )}
                  >
                    {isSelected && <Check className="h-4 w-4 text-white drop-shadow" />}
                  </button>
                );
              })}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Guardar cambios" : "Crear materia"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
