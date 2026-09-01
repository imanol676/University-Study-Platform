"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import {
  ResetPasswordSchema,
  ResetPasswordInput,
} from "@/features/auth/schemas/auth.schema";
import { resetPasswordAction } from "@/features/auth/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ResetPasswordForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    try {
      setIsLoading(true);
      setServerError(null);

      const result = await resetPasswordAction(data);

      if (!result.success) {
        setServerError(result.error ?? "No se pudo actualizar la contraseña");
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);
    } catch (err) {
      console.error(err);
      setServerError("Ocurrió un error inesperado. Intentalo nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="w-full shadow-[0_16px_48px_rgba(0,0,0,0.5)] border border-white/[0.12] bg-slate-950/60 backdrop-blur-2xl">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary border border-primary/20 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white/95">
            ¡Contraseña actualizada!
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Tu contraseña ha sido modificada con éxito. Redirigiendo a tu panel...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-[0_16px_48px_rgba(0,0,0,0.5)] border border-white/[0.12] bg-slate-950/60 backdrop-blur-2xl">
      <CardHeader className="space-y-1.5 text-center pb-6">
        <CardTitle className="text-2xl font-bold tracking-tight text-white/95">
          Nueva contraseña
        </CardTitle>
        <CardDescription className="text-zinc-400 text-sm">
          Ingresá una contraseña segura de al menos 8 caracteres
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {serverError && (
            <div className="rounded-xl bg-destructive/15 p-3 text-sm text-destructive border border-destructive/25 backdrop-blur-md">
              {serverError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Nueva contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              disabled={isLoading}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repetí la nueva contraseña"
              autoComplete="new-password"
              disabled={isLoading}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Actualizar contraseña
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
