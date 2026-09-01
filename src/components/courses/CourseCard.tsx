"use client";

import Link from "next/link";
import { BookOpen, MoreVertical, Edit3, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { Course, CourseColor } from "@/types/course";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  course: Course;
  onEdit?: (course: Course) => void;
  onDelete?: (course: Course) => void;
  onArchiveToggle?: (course: Course) => void;
}

const colorMap: Record<
  CourseColor,
  {
    badgeVariant: "indigo" | "blue" | "emerald" | "amber" | "rose" | "purple" | "slate" | "cyan";
    accentBorder: string;
    iconBg: string;
    iconColor: string;
    glow: string;
  }
> = {
  INDIGO: {
    badgeVariant: "indigo",
    accentBorder: "group-hover:border-indigo-500/40",
    iconBg: "bg-indigo-500/15 border-indigo-500/25",
    iconColor: "text-indigo-400",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.25)]",
  },
  BLUE: {
    badgeVariant: "blue",
    accentBorder: "group-hover:border-blue-500/40",
    iconBg: "bg-blue-500/15 border-blue-500/25",
    iconColor: "text-blue-400",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.25)]",
  },
  EMERALD: {
    badgeVariant: "emerald",
    accentBorder: "group-hover:border-emerald-500/40",
    iconBg: "bg-emerald-500/15 border-emerald-500/25",
    iconColor: "text-emerald-400",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.25)]",
  },
  AMBER: {
    badgeVariant: "amber",
    accentBorder: "group-hover:border-amber-500/40",
    iconBg: "bg-amber-500/15 border-amber-500/25",
    iconColor: "text-amber-400",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.25)]",
  },
  ROSE: {
    badgeVariant: "rose",
    accentBorder: "group-hover:border-rose-500/40",
    iconBg: "bg-rose-500/15 border-rose-500/25",
    iconColor: "text-rose-400",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(244,63,94,0.25)]",
  },
  PURPLE: {
    badgeVariant: "purple",
    accentBorder: "group-hover:border-purple-500/40",
    iconBg: "bg-purple-500/15 border-purple-500/25",
    iconColor: "text-purple-400",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.25)]",
  },
  SLATE: {
    badgeVariant: "slate",
    accentBorder: "group-hover:border-slate-400/40",
    iconBg: "bg-slate-500/15 border-slate-400/25",
    iconColor: "text-slate-300",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(148,163,184,0.2)]",
  },
  CYAN: {
    badgeVariant: "cyan",
    accentBorder: "group-hover:border-cyan-500/40",
    iconBg: "bg-cyan-500/15 border-cyan-500/25",
    iconColor: "text-cyan-400",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.25)]",
  },
};

export function CourseCard({
  course,
  onEdit,
  onDelete,
  onArchiveToggle,
}: CourseCardProps) {
  const colorConfig = colorMap[course.color] ?? colorMap.INDIGO;

  return (
    <Card
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-0.5",
        colorConfig.accentBorder,
        colorConfig.glow,
        course.isArchived && "opacity-75"
      )}
    >
      <Link
        href={`/courses/${course.id}`}
        className="absolute inset-0 z-0"
        aria-label={`Ver materia ${course.name}`}
      />

      <div>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border backdrop-blur-md transition-transform duration-300 group-hover:scale-105",
                colorConfig.iconBg
              )}
            >
              <BookOpen className={cn("h-5 w-5", colorConfig.iconColor)} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                {course.code && (
                  <Badge variant={colorConfig.badgeVariant} className="font-mono text-[10px]">
                    {course.code}
                  </Badge>
                )}
                {course.isArchived && (
                  <Badge variant="outline" className="text-[10px] text-zinc-400">
                    Archivada
                  </Badge>
                )}
              </div>
              <CardTitle className="mt-1 line-clamp-1 text-base font-semibold text-white/95">
                {course.name}
              </CardTitle>
            </div>
          </div>

          {/* Context Menu (z-10 to stay above link) */}
          <div className="relative z-10 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-400 hover:text-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Acciones de materia</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {onEdit && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(course);
                    }}
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    <span>Editar materia</span>
                  </DropdownMenuItem>
                )}
                {onArchiveToggle && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchiveToggle(course);
                    }}
                  >
                    {course.isArchived ? (
                      <>
                        <ArchiveRestore className="mr-2 h-4 w-4" />
                        <span>Desarchivar</span>
                      </>
                    ) : (
                      <>
                        <Archive className="mr-2 h-4 w-4" />
                        <span>Archivar</span>
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(course);
                      }}
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Eliminar</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-2 pb-3">
          {course.description ? (
            <p className="line-clamp-2 text-xs text-zinc-400 leading-relaxed">
              {course.description}
            </p>
          ) : (
            <p className="text-xs text-zinc-500 italic">Sin descripción</p>
          )}
        </CardContent>
      </div>

      <CardFooter className="flex items-center justify-between border-t border-white/[0.06] pt-3 text-[11px] text-zinc-400">
        <span>{course.term || "Período no especificado"}</span>
        <span className="font-medium text-primary group-hover:underline">
          Abrir materia &rarr;
        </span>
      </CardFooter>
    </Card>
  );
}
