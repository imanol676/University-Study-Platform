import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-primary/90 to-primary text-primary-foreground shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] border border-white/20 hover:brightness-110",
        destructive:
          "bg-gradient-to-b from-destructive/90 to-destructive text-destructive-foreground shadow-sm hover:brightness-110 border border-white/10",
        outline:
          "border border-white/[0.12] bg-white/[0.04] backdrop-blur-md shadow-sm hover:bg-white/[0.09] hover:border-white/[0.2] text-foreground",
        secondary:
          "bg-white/[0.08] text-foreground backdrop-blur-md border border-white/[0.08] shadow-sm hover:bg-white/[0.14] hover:border-white/[0.16]",
        ghost: "hover:bg-white/[0.08] text-zinc-300 hover:text-white",
        link: "text-primary underline-offset-4 hover:underline",
        glass:
          "bg-slate-900/60 backdrop-blur-xl border border-white/[0.12] text-white shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:bg-slate-800/70 hover:border-white/[0.2]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-8 text-base",
        icon: "h-9 w-9 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
