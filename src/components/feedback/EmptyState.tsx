import React from "react";
import { LucideIcon, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.12] bg-slate-900/30 backdrop-blur-xl p-8 text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.25)]">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/[0.1] text-zinc-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-base font-semibold text-white/95 mb-1.5">{title}</h3>
      <p className="text-sm text-zinc-400 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" variant="glass">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
