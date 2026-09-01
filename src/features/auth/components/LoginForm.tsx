"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import {
  SignInSchema,
  SignInInput,
} from "@/features/auth/schemas/auth.schema";
import { signInAction } from "@/features/auth/actions/auth.actions";
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

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const errorParam = searchParams.get("error");

  const [serverError, setServerError] = useState<string | null>(
    errorParam ? "Sesión caducada o enlace inválido. Por favor ingresá nuevamente." : null
  );
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInInput) => {
    try {
      setIsLoading(true);
      setServerError(null);

      const result = await signInAction(data);

      if (!result.success) {
        setServerError(result.error ?? "No se pudo iniciar sesión");
        return;
      }

      router.push(next);
      router.refresh();
    } catch (err) {
      console.error(err);
      setServerError("Ocurrió un error inesperado. Intentalo nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-[0_16px_48px_rgba(0,0,0,0.5)] border border-white/[0.12] bg-slate-950/60 backdrop-blur-2xl">
      <CardHeader className="space-y-1.5 text-center pb-6">
        <CardTitle className="text-2xl font-bold tracking-tight text-white/95">
          Iniciar sesión
        </CardTitle>
        <CardDescription className="text-zinc-400 text-sm">
          Ingresá tus credenciales para acceder a tus materias y sesiones de estudio
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
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="estudiante@universidad.edu"
              autoComplete="email"
              disabled={isLoading}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline"
                tabIndex={-1}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isLoading}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Ingresar
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            ¿No tenés una cuenta?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Registrate
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
