import React from "react";
import {
  FileText,
  Presentation,
  Headphones,
  Image as ImageIcon,
  StickyNote,
} from "lucide-react";
import { MaterialType } from "@/types/material";
import { cn } from "@/lib/utils";

interface MaterialTypeBadgeProps {
  type: MaterialType;
  showLabel?: boolean;
  className?: string;
}

export const materialTypeConfig: Record<
  MaterialType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badgeClass: string;
    iconClass: string;
  }
> = {
  PDF: {
    label: "PDF",
    icon: FileText,
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    iconClass: "text-rose-400",
  },
  PPTX: {
    label: "Presentación",
    icon: Presentation,
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    iconClass: "text-amber-400",
  },
  AUDIO: {
    label: "Audio",
    icon: Headphones,
    badgeClass: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    iconClass: "text-indigo-400",
  },
  IMAGE: {
    label: "Imagen",
    icon: ImageIcon,
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    iconClass: "text-emerald-400",
  },
  NOTE: {
    label: "Apunte / Nota",
    icon: StickyNote,
    badgeClass: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    iconClass: "text-sky-400",
  },
};

export function MaterialTypeBadge({
  type,
  showLabel = true,
  className,
}: MaterialTypeBadgeProps) {
  const config = materialTypeConfig[type] ?? materialTypeConfig.PDF;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border backdrop-blur-md",
        config.badgeClass,
        className
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
