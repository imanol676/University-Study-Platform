"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  BarChart2,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserNav } from "@/components/layout/UserNav";

interface SidebarProps {
  user: {
    email: string;
    fullName?: string | null;
    avatarUrl?: string | null;
  };
}

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Materias",
    href: "/courses",
    icon: BookOpen,
  },
  {
    title: "Progreso",
    href: "/progress",
    icon: BarChart2,
  },
  {
    title: "Configuración",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r border-white/[0.08] bg-slate-950/40 backdrop-blur-2xl shadow-[1px_0_24px_rgba(0,0,0,0.5)]">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-white/[0.08] px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/90 to-primary text-primary-foreground shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-white/20">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm tracking-tight text-white/95">
            Study Platform
          </span>
          <span className="text-[11px] text-zinc-400 font-medium">
            Active Recall & Audio
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-white/[0.1] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] border border-white/[0.12] backdrop-blur-md"
                    : "text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200 border border-transparent"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-primary" : "text-zinc-400"
                  )}
                />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="border-t border-white/[0.08] p-3">
        <UserNav user={user} />
      </div>
    </aside>
  );
}
