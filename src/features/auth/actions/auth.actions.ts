"use server";

import { authService } from "@/services/auth/auth.service";
import {
  SignInSchema,
  SignUpSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  SignInInput,
  SignUpInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@/features/auth/schemas/auth.schema";
import { AuthResponse } from "@/types/auth";
import { UserProfile } from "@/types/user";

export async function signInAction(
  input: SignInInput
): Promise<AuthResponse<UserProfile>> {
  const parsed = SignInSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Datos inválidos",
    };
  }

  return await authService.signInWithPassword(parsed.data);
}

export async function signUpAction(
  input: SignUpInput
): Promise<AuthResponse<{ id: string; email: string }>> {
  const parsed = SignUpSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Datos inválidos",
    };
  }

  return await authService.signUp(parsed.data);
}

export async function signOutAction(): Promise<AuthResponse<void>> {
  return await authService.signOut();
}

export async function forgotPasswordAction(
  input: ForgotPasswordInput,
  origin: string
): Promise<AuthResponse<void>> {
  const parsed = ForgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Datos inválidos",
    };
  }

  const redirectTo = `${origin}/api/auth/callback?next=/reset-password`;
  return await authService.forgotPassword(parsed.data.email, redirectTo);
}

export async function resetPasswordAction(
  input: ResetPasswordInput
): Promise<AuthResponse<void>> {
  const parsed = ResetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Datos inválidos",
    };
  }

  return await authService.resetPassword(parsed.data.password);
}
