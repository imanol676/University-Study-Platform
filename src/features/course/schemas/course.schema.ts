import { z } from "zod";

export const CourseColorSchema = z.enum([
  "INDIGO",
  "BLUE",
  "EMERALD",
  "AMBER",
  "ROSE",
  "PURPLE",
  "SLATE",
  "CYAN",
]);

export const CreateCourseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre de la materia debe tener al menos 2 caracteres")
    .max(120, "El nombre no puede exceder 120 caracteres"),
  code: z
    .string()
    .trim()
    .max(30, "El código no puede exceder 30 caracteres")
    .nullable()
    .transform((val) => (val === "" ? null : val))
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, "La descripción no puede exceder 500 caracteres")
    .nullable()
    .transform((val) => (val === "" ? null : val))
    .optional(),
  term: z
    .string()
    .trim()
    .max(60, "El período no puede exceder 60 caracteres")
    .nullable()
    .transform((val) => (val === "" ? null : val))
    .optional(),
  color: CourseColorSchema.default("INDIGO"),
});

export const UpdateCourseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre de la materia debe tener al menos 2 caracteres")
    .max(120, "El nombre no puede exceder 120 caracteres")
    .optional(),
  code: z
    .string()
    .trim()
    .max(30, "El código no puede exceder 30 caracteres")
    .nullable()
    .transform((val) => (val === "" ? null : val))
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, "La descripción no puede exceder 500 caracteres")
    .nullable()
    .transform((val) => (val === "" ? null : val))
    .optional(),
  term: z
    .string()
    .trim()
    .max(60, "El período no puede exceder 60 caracteres")
    .nullable()
    .transform((val) => (val === "" ? null : val))
    .optional(),
  color: CourseColorSchema.optional(),
  isArchived: z.boolean().optional(),
});

export type CreateCourseInput = z.infer<typeof CreateCourseSchema>;
export type UpdateCourseInput = z.infer<typeof UpdateCourseSchema>;
