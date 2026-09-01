import { describe, it, expect } from "vitest";
import {
  CreateCourseSchema,
  UpdateCourseSchema,
  CourseColorSchema,
} from "../course.schema";

describe("Course Schemas", () => {
  describe("CourseColorSchema", () => {
    it("should accept valid colors", () => {
      const validColors = [
        "INDIGO",
        "BLUE",
        "EMERALD",
        "AMBER",
        "ROSE",
        "PURPLE",
        "SLATE",
        "CYAN",
      ];
      validColors.forEach((color) => {
        expect(CourseColorSchema.safeParse(color).success).toBe(true);
      });
    });

    it("should reject invalid colors", () => {
      expect(CourseColorSchema.safeParse("RED").success).toBe(false);
      expect(CourseColorSchema.safeParse("").success).toBe(false);
    });
  });

  describe("CreateCourseSchema", () => {
    it("should validate and trim valid course data", () => {
      const input = {
        name: "  Sistemas Distribuidos  ",
        code: "  SD-101  ",
        description: "  Fundamentos de sistemas distribuidos y consenso  ",
        term: "  2do Cuatrimestre 2026  ",
        color: "EMERALD",
      };

      const result = CreateCourseSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Sistemas Distribuidos");
        expect(result.data.code).toBe("SD-101");
        expect(result.data.description).toBe(
          "Fundamentos de sistemas distribuidos y consenso"
        );
        expect(result.data.term).toBe("2do Cuatrimestre 2026");
        expect(result.data.color).toBe("EMERALD");
      }
    });

    it("should assign INDIGO as default color if omitted", () => {
      const input = {
        name: "Arquitectura de Software",
      };

      const result = CreateCourseSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.color).toBe("INDIGO");
        expect(result.data.code).toBeUndefined();
        expect(result.data.description).toBeUndefined();
        expect(result.data.term).toBeUndefined();
      }
    });

    it("should convert empty strings in optional fields to null", () => {
      const input = {
        name: "Algoritmos",
        code: "   ",
        description: "",
        term: "   ",
      };

      const result = CreateCourseSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.code).toBeNull();
        expect(result.data.description).toBeNull();
        expect(result.data.term).toBeNull();
      }
    });

    it("should fail if name is less than 2 characters", () => {
      const input = {
        name: "A",
      };

      const result = CreateCourseSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]!.message).toContain("al menos 2 caracteres");
      }
    });

    it("should fail if name exceeds 120 characters", () => {
      const input = {
        name: "A".repeat(121),
      };

      const result = CreateCourseSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]!.message).toContain("no puede exceder 120 caracteres");
      }
    });
  });

  describe("UpdateCourseSchema", () => {
    it("should allow partial updates", () => {
      const input = {
        name: "Sistemas Distribuidos Avanzados",
        isArchived: true,
      };

      const result = UpdateCourseSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Sistemas Distribuidos Avanzados");
        expect(result.data.isArchived).toBe(true);
      }
    });
  });
});
