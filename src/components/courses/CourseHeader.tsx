"use client";

import Link from "next/link";
import { ChevronRight, BookOpen, Edit3, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { Course } from "@/types/course";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CourseHeaderProps {
  course: Course;
  onEdit: () => void;
  onArchiveToggle: () => void;
  onDelete: () => void;
}

export function CourseHeader({
  course,
  onEdit,
  onArchiveToggle,
  onDelete,
}: CourseHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs text-zinc-400">
        <Link
          href="/courses"
          className="hover:text-white transition-colors"
        >
          Materias
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
        <span className="font-medium text-white/90 truncate max-w-[200px] sm:max-w-md">
          {course.name}
        </span>
      </nav>

      {/* Main Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary border border-primary/25 shadow-[0_0_20px_rgba(99,102,241,0.25)]">
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white/95">
                {course.name}
              </h1>
              {course.code && (
                <Badge variant="default" className="font-mono text-xs">
                  {course.code}
                </Badge>
              )}
              {course.isArchived && (
                <Badge variant="outline" className="text-zinc-400">
                  Archivada
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-zinc-400">
              {course.term || "Período no especificado"}
              {course.description ? ` • ${course.description}` : ""}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="text-xs"
          >
            <Edit3 className="mr-1.5 h-3.5 w-3.5" />
            Editar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onArchiveToggle}
            className="text-xs"
          >
            {course.isArchived ? (
              <>
                <ArchiveRestore className="mr-1.5 h-3.5 w-3.5" />
                Desarchivar
              </>
            ) : (
              <>
                <Archive className="mr-1.5 h-3.5 w-3.5" />
                Archivar
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-xs text-destructive hover:bg-destructive/15 hover:text-destructive hover:border-destructive/30"
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
}
