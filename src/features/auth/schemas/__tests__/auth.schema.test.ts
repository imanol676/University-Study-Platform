import { describe, it, expect } from "vitest";
import {
  SignInSchema,
  SignUpSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "../auth.schema";

describe("Auth Validation Schemas", () => {
  describe("SignInSchema", () => {
    it("should accept valid credentials", () => {
      const result = SignInSchema.safeParse({
        email: "student@university.edu",
        password: "password123",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("student@university.edu");
      }
    });

    it("should reject invalid email", () => {
      const result = SignInSchema.safeParse({
        email: "not-an-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty password", () => {
      const result = SignInSchema.safeParse({
        email: "student@university.edu",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("SignUpSchema", () => {
    it("should accept valid registration data", () => {
      const result = SignUpSchema.safeParse({
        fullName: "Ana García",
        email: "ana@university.edu",
        password: "securePassword123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject password with less than 8 characters", () => {
      const result = SignUpSchema.safeParse({
        fullName: "Ana García",
        email: "ana@university.edu",
        password: "short",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toContain("al menos 8 caracteres");
      }
    });

    it("should reject name with less than 2 characters", () => {
      const result = SignUpSchema.safeParse({
        fullName: "A",
        email: "ana@university.edu",
        password: "securePassword123",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("ForgotPasswordSchema", () => {
    it("should validate valid email", () => {
      const result = ForgotPasswordSchema.safeParse({
        email: "ana@university.edu",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = ForgotPasswordSchema.safeParse({
        email: "invalid-email",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("ResetPasswordSchema", () => {
    it("should accept matching passwords with at least 8 characters", () => {
      const result = ResetPasswordSchema.safeParse({
        password: "newSecurePassword123",
        confirmPassword: "newSecurePassword123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject non-matching passwords", () => {
      const result = ResetPasswordSchema.safeParse({
        password: "newSecurePassword123",
        confirmPassword: "differentPassword123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toBe("Las contraseñas no coinciden");
      }
    });
  });
});
