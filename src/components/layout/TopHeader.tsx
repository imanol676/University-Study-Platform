"use client";

import { GraduationCap } from "lucide-react";
import { UserNav } from "@/components/layout/UserNav";

interface TopHeaderProps {
  user: {
    email: string;
    fullName?: string | null;
    avatarUrl?: string | null;
  };
}

export function TopHeader({ user }: TopHeaderProps) {
  return (
    <header className="flex md:hidden h-14 items-center justify-between border-b border-white/[0.08] bg-slate-950/60 backdrop-blur-2xl px-4 sticky top-0 z-40">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary/90 to-primary text-primary-foreground shadow-[0_0_12px_rgba(99,102,241,0.35)] border border-white/20">
          <GraduationCap className="h-4 w-4" />
        </div>
        <span className="font-semibold text-sm tracking-tight text-white/95">
          Study Platform
        </span>
      </div>
      <div className="flex items-center">
        <UserNav user={user} />
      </div>
    </header>
  );
}
