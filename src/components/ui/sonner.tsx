"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-slate-950/85 group-[.toaster]:backdrop-blur-2xl group-[.toaster]:text-white group-[.toaster]:border-white/[0.12] group-[.toaster]:shadow-[0_12px_40px_rgba(0,0,0,0.6)] group-[.toaster]:rounded-2xl",
          description: "group-[.toast]:text-zinc-400",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-xl",
          cancelButton:
            "group-[.toast]:bg-white/[0.08] group-[.toast]:text-zinc-300 group-[.toast]:rounded-xl",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
