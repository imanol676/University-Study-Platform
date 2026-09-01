import { authService } from "@/services/auth/auth.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default async function SettingsPage() {
  const session = await authService.getCurrentSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Configuración
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ajustes de cuenta, perfil y preferencias de estudio
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card className="hover:border-white/[0.18] transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white/95">Perfil del Estudiante</CardTitle>
            <CardDescription className="text-zinc-400">
              Información asociada a tu cuenta académica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-zinc-300">Nombre completo</Label>
              <Input
                id="fullName"
                defaultValue={session?.profile?.fullName ?? ""}
                disabled
                className="bg-white/[0.02] border-white/[0.08] text-zinc-300 cursor-default"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Correo electrónico</Label>
              <Input
                id="email"
                defaultValue={session?.user?.email ?? ""}
                disabled
                className="bg-white/[0.02] border-white/[0.08] text-zinc-300 cursor-default"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-zinc-300">Rol</Label>
              <Input
                id="role"
                defaultValue={session?.profile?.role ?? "STUDENT"}
                disabled
                className="bg-white/[0.02] border-white/[0.08] text-zinc-300 cursor-default"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
