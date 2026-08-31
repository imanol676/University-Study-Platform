import { createClient } from "@/lib/supabase/server";
import { userRepository, IUserRepository } from "@/repositories/user.repository";
import { SignInInput, SignUpInput } from "@/features/auth/schemas/auth.schema";
import { AuthResponse, AuthSession } from "@/types/auth";
import { UserProfile } from "@/types/user";

export interface IAuthService {
  signUp(input: SignUpInput): Promise<AuthResponse<{ id: string; email: string }>>;
  signInWithPassword(input: SignInInput): Promise<AuthResponse<UserProfile>>;
  signOut(): Promise<AuthResponse<void>>;
  forgotPassword(email: string, redirectTo: string): Promise<AuthResponse<void>>;
  resetPassword(password: string): Promise<AuthResponse<void>>;
  getCurrentSession(): Promise<AuthSession | null>;
}

export class AuthService implements IAuthService {
  constructor(private userRepo: IUserRepository = userRepository) {}

  async signUp(input: SignUpInput): Promise<AuthResponse<{ id: string; email: string }>> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            full_name: input.fullName,
          },
        },
      });

      if (error) {
        return {
          success: false,
          error: this.mapAuthError(error.message),
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: "No se pudo crear el usuario",
        };
      }

      // Check if email confirmation is required
      const requiresEmailConfirmation = !data.session;

      return {
        success: true,
        data: {
          id: data.user.id,
          email: data.user.email ?? input.email,
        },
        requiresEmailConfirmation,
      };
    } catch (err) {
      console.error("AuthService.signUp error:", err);
      return {
        success: false,
        error: "Ocurrió un error inesperado al registrar la cuenta",
      };
    }
  }

  async signInWithPassword(input: SignInInput): Promise<AuthResponse<UserProfile>> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (error) {
        return {
          success: false,
          error: this.mapAuthError(error.message),
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: "Credenciales inválidas",
        };
      }

      const profile = await this.userRepo.findById(data.user.id);
      if (!profile) {
        // Fallback: if database trigger had any delay, create or return minimal profile
        const newProfile = await this.userRepo.create({
          id: data.user.id,
          email: data.user.email ?? input.email,
          fullName: data.user.user_metadata?.full_name ?? null,
        });
        return {
          success: true,
          data: newProfile,
        };
      }

      return {
        success: true,
        data: profile,
      };
    } catch (err) {
      console.error("AuthService.signInWithPassword error:", err);
      return {
        success: false,
        error: "Ocurrió un error inesperado al iniciar sesión",
      };
    }
  }

  async signOut(): Promise<AuthResponse<void>> {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }
      return { success: true };
    } catch (err) {
      console.error("AuthService.signOut error:", err);
      return {
        success: false,
        error: "Ocurrió un error al cerrar sesión",
      };
    }
  }

  async forgotPassword(email: string, redirectTo: string): Promise<AuthResponse<void>> {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        return {
          success: false,
          error: this.mapAuthError(error.message),
        };
      }

      return { success: true };
    } catch (err) {
      console.error("AuthService.forgotPassword error:", err);
      return {
        success: false,
        error: "Ocurrió un error al solicitar la recuperación de contraseña",
      };
    }
  }

  async resetPassword(password: string): Promise<AuthResponse<void>> {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        return {
          success: false,
          error: this.mapAuthError(error.message),
        };
      }

      return { success: true };
    } catch (err) {
      console.error("AuthService.resetPassword error:", err);
      return {
        success: false,
        error: "Ocurrió un error al actualizar la contraseña",
      };
    }
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      const profile = await this.userRepo.findById(user.id);
      return {
        user: {
          id: user.id,
          email: user.email ?? "",
        },
        profile,
      };
    } catch (err) {
      if (
        typeof err === "object" &&
        err !== null &&
        "digest" in err &&
        (err as { digest?: string }).digest === "DYNAMIC_SERVER_USAGE"
      ) {
        throw err;
      }
      console.error("AuthService.getCurrentSession error:", err);
      return null;
    }
  }

  private mapAuthError(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes("invalid login credentials")) {
      return "Correo electrónico o contraseña incorrectos";
    }
    if (lower.includes("user already registered")) {
      return "Ya existe una cuenta registrada con este correo electrónico";
    }
    if (lower.includes("email not confirmed")) {
      return "Por favor confirmá tu correo electrónico antes de ingresar";
    }
    if (lower.includes("rate limit")) {
      return "Demasiados intentos. Por favor esperá unos momentos antes de reintentar";
    }
    return "No se pudo completar la operación. Por favor intentá nuevamente";
  }
}

export const authService = new AuthService();
