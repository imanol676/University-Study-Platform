"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateNoteSchema,
  CreateNoteInput,
} from "@/features/material/schemas/material.schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, StickyNote } from "lucide-react";
import { toast } from "sonner";

interface NoteEditorDialogProps {
  courseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitNote: (data: CreateNoteInput) => Promise<void>;
  isPending: boolean;
}

export function NoteEditorDialog({
  courseId,
  open,
  onOpenChange,
  onSubmitNote,
  isPending,
}: NoteEditorDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateNoteInput>({
    resolver: zodResolver(CreateNoteSchema),
    defaultValues: {
      courseId,
      title: "",
      content: "",
      description: "",
    },
  });

  const contentValue = watch("content") || "";

  const onSubmit = async (data: CreateNoteInput) => {
    try {
      await onSubmitNote({
        ...data,
        courseId,
      });
      toast.success("Apunte guardado correctamente");
      reset({
        courseId,
        title: "",
        content: "",
        description: "",
      });
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al guardar el apunte"
      );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          reset({
            courseId,
            title: "",
            content: "",
            description: "",
          });
        }
        onOpenChange(val);
      }}
    >
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <StickyNote className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle>Nuevo apunte de texto</DialogTitle>
              <DialogDescription>
                Escribí o pegá notas, resúmenes o temarios de clase
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Título */}
          <div className="space-y-1.5">
            <Label htmlFor="note-title" className="text-xs font-semibold text-zinc-300">
              Título del apunte <span className="text-primary">*</span>
            </Label>
            <Input
              id="note-title"
              placeholder="Ej: Resumen Clase 4 - Concurrencia y Semáforos"
              disabled={isPending}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Contenido */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="note-content"
                className="text-xs font-semibold text-zinc-300"
              >
                Contenido del apunte <span className="text-primary">*</span>
              </Label>
              <span className="text-[11px] text-zinc-500 font-mono">
                {contentValue.length} / 50.000
              </span>
            </div>
            <Textarea
              id="note-content"
              placeholder="Escribí aquí las notas o pegá texto en markdown..."
              rows={8}
              disabled={isPending}
              className="font-mono text-xs"
              {...register("content")}
            />
            {errors.content && (
              <p className="text-xs text-destructive">{errors.content.message}</p>
            )}
          </div>

          {/* Descripción opcional */}
          <div className="space-y-1.5">
            <Label
              htmlFor="note-desc"
              className="text-xs font-semibold text-zinc-300"
            >
              Descripción corta <span className="text-zinc-500 font-normal">(Opcional)</span>
            </Label>
            <Input
              id="note-desc"
              placeholder="Ej: Dictado por el docente, entra en el 1er parcial"
              disabled={isPending}
              {...register("description")}
            />
          </div>

          <DialogFooter className="pt-3">
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
              Guardar apunte
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
