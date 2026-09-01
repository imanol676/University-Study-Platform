import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-white/10 bg-white/[0.08] text-white backdrop-blur-md",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive/20 text-destructive border-destructive/30",
        outline: "text-foreground border-white/[0.12]",
        indigo: "bg-indigo-500/15 text-indigo-300 border-indigo-500/25",
        blue: "bg-blue-500/15 text-blue-300 border-blue-500/25",
        emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
        amber: "bg-amber-500/15 text-amber-300 border-amber-500/25",
        rose: "bg-rose-500/15 text-rose-300 border-rose-500/25",
        purple: "bg-purple-500/15 text-purple-300 border-purple-500/25",
        slate: "bg-slate-500/15 text-slate-300 border-slate-500/25",
        cyan: "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
