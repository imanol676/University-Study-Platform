import { z } from "zod";

export const SignInSchema = z.object({
  email: z
    .string({ required_error: "Ingresá tu correo electrónico" })
    .email("Ingresá un correo electrónico válido")
    .trim()
    .toLowerCase(),
  password: z
    .string({ required_error: "Ingresá tu contraseña" })
    .min(1, "Ingresá tu contraseña"),
});

export const SignUpSchema = z.object({
  fullName: z
    .string({ required_error: "Ingresá tu nombre completo" })
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .trim(),
  email: z
    .string({ required_error: "Ingresá tu correo electrónico" })
    .email("Ingresá un correo electrónico válido")
    .trim()
    .toLowerCase(),
  password: z
    .string({ required_error: "Ingresá una contraseña" })
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const ForgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Ingresá tu correo electrónico" })
    .email("Ingresá un correo electrónico válido")
    .trim()
    .toLowerCase(),
});

export const ResetPasswordSchema = z
  .object({
    password: z
      .string({ required_error: "Ingresá tu nueva contraseña" })
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z
      .string({ required_error: "Confirmá tu nueva contraseña" })
      .min(8, "La confirmación debe tener al menos 8 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type SignInInput = z.infer<typeof SignInSchema>;
export type SignUpInput = z.infer<typeof SignUpSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
