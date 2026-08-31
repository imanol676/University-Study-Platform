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
    <header className="flex md:hidden h-14 items-center justify-between border-b border-border bg-card px-4 sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <GraduationCap className="h-4 w-4" />
        </div>
        <span className="font-semibold text-sm tracking-tight text-foreground">
          Study Platform
        </span>
      </div>
      <div className="flex items-center">
        <UserNav user={user} />
      </div>
    </header>
  );
}
