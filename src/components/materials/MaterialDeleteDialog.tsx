"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Material } from "@/types/material";
import { Loader2, AlertTriangle } from "lucide-react";

interface MaterialDeleteDialogProps {
  material: Material | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (material: Material) => Promise<void>;
  isPending: boolean;
}

export function MaterialDeleteDialog({
  material,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: MaterialDeleteDialogProps) {
  if (!material) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/15 text-destructive border border-destructive/20">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Eliminar material</DialogTitle>
              <DialogDescription className="mt-1">
                Esta acción no se puede deshacer.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2 text-sm text-zinc-300">
          ¿Estás seguro de que querés eliminar{" "}
          <span className="font-semibold text-white">
            &ldquo;{material.title}&rdquo;
          </span>
          ? El archivo se borrará permanentemente de tu cuenta y del almacenamiento.
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => onConfirm(material)}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Eliminar permanentemente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
