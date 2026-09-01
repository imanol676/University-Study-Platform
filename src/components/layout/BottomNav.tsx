"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  BarChart2,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Inicio",
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
    title: "Ajustes",
    href: "/settings",
    icon: Settings,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="flex md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-white/[0.08] bg-slate-950/75 backdrop-blur-2xl px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
      <div className="grid h-full w-full grid-cols-4 items-center">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 h-full py-1 text-[11px] font-medium transition-all duration-200",
                isActive
                  ? "text-primary font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center p-1 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-primary/15 text-primary shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                    : "text-zinc-400"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isActive ? "scale-110" : ""
                  )}
                />
              </div>
              <span className="truncate">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
