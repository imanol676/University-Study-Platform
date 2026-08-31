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
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Perfil del Estudiante</CardTitle>
            <CardDescription>
              Información asociada a tu cuenta académica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input
                id="fullName"
                defaultValue={session?.profile?.fullName ?? ""}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                defaultValue={session?.user?.email ?? ""}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Input
                id="role"
                defaultValue={session?.profile?.role ?? "STUDENT"}
                disabled
                className="bg-muted"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
