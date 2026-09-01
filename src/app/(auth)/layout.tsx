import { GraduationCap } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 overflow-hidden">
      {/* Subtle background glow effect */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Link
            href="/"
            className="flex items-center space-x-3 text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl p-1 transition-transform hover:scale-105"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/90 to-primary text-primary-foreground shadow-[0_0_20px_rgba(99,102,241,0.45)] border border-white/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white/95">
              University Study Platform
            </span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
