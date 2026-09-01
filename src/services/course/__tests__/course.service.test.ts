import { describe, it, expect, vi, beforeEach } from "vitest";
import { CourseService } from "../course.service";
import { ICourseRepository } from "@/repositories/course.repository";
import { Course } from "@/types/course";

describe("CourseService", () => {
  let service: CourseService;
  let mockRepo: ICourseRepository;

  const mockCourse: Course = {
    id: "course-123",
    userId: "user-456",
    name: "Sistemas Operativos",
    code: "SO-2026",
    description: "Materia de 3er año",
    term: "1er Cuatrimestre",
    color: "INDIGO",
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      findAllByUserId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      countActiveByUserId: vi.fn(),
    };
    service = new CourseService(mockRepo);
  });

  describe("getCourses", () => {
    it("should return courses belonging to the user", async () => {
      vi.mocked(mockRepo.findAllByUserId).mockResolvedValue([mockCourse]);

      const result = await service.getCourses("user-456");

      expect(mockRepo.findAllByUserId).toHaveBeenCalledWith("user-456", undefined);
      expect(result).toHaveLength(1);
      expect(result[0]!.name).toBe("Sistemas Operativos");
    });

    it("should throw error if userId is missing", async () => {
      await expect(service.getCourses("")).rejects.toThrow("El ID de usuario es obligatorio");
    });
  });

  describe("getCourseById", () => {
    it("should return course when requested by the owner", async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(mockCourse);

      const result = await service.getCourseById("user-456", "course-123");

      expect(mockRepo.findById).toHaveBeenCalledWith("course-123");
      expect(result).toEqual(mockCourse);
    });

    it("should return null if course belongs to another user", async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(mockCourse);

      const result = await service.getCourseById("different-user", "course-123");

      expect(result).toBeNull();
    });

    it("should return null if course does not exist", async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(null);

      const result = await service.getCourseById("user-456", "non-existent");

      expect(result).toBeNull();
    });
  });

  describe("createCourse", () => {
    it("should create course successfully with valid input", async () => {
      vi.mocked(mockRepo.create).mockResolvedValue(mockCourse);

      const input = {
        name: "Sistemas Operativos",
        code: "SO-2026",
        description: "Materia de 3er año",
        term: "1er Cuatrimestre",
        color: "INDIGO" as const,
      };

      const result = await service.createCourse("user-456", input);

      expect(mockRepo.create).toHaveBeenCalledWith("user-456", input);
      expect(result.name).toBe("Sistemas Operativos");
    });

    it("should throw error if name is too short", async () => {
      await expect(
        service.createCourse("user-456", { name: "A", color: "INDIGO" as const })
      ).rejects.toThrow("El nombre de la materia debe tener al menos 2 caracteres");
    });
  });

  describe("updateCourse", () => {
    it("should update course when user is the owner", async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(mockCourse);
      vi.mocked(mockRepo.update).mockResolvedValue({
        ...mockCourse,
        name: "Sistemas Operativos II",
      });

      const result = await service.updateCourse("user-456", "course-123", {
        name: "Sistemas Operativos II",
      });

      expect(mockRepo.update).toHaveBeenCalledWith("course-123", {
        name: "Sistemas Operativos II",
      });
      expect(result.name).toBe("Sistemas Operativos II");
    });

    it("should throw error when updating course of another user", async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(mockCourse);

      await expect(
        service.updateCourse("different-user", "course-123", { name: "Hack" })
      ).rejects.toThrow("Materia no encontrada o no autorizada");
    });
  });

  describe("deleteCourse", () => {
    it("should delete course when user is the owner", async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(mockCourse);
      vi.mocked(mockRepo.delete).mockResolvedValue();

      await service.deleteCourse("user-456", "course-123");

      expect(mockRepo.delete).toHaveBeenCalledWith("course-123");
    });

    it("should throw error when deleting course of another user", async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(mockCourse);

      await expect(service.deleteCourse("different-user", "course-123")).rejects.toThrow(
        "Materia no encontrada o no autorizada"
      );
    });
  });

  describe("archiveCourse", () => {
    it("should toggle isArchived when user is the owner", async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(mockCourse);
      vi.mocked(mockRepo.update).mockResolvedValue({
        ...mockCourse,
        isArchived: true,
      });

      const result = await service.archiveCourse("user-456", "course-123", true);

      expect(mockRepo.update).toHaveBeenCalledWith("course-123", { isArchived: true });
      expect(result.isArchived).toBe(true);
    });
  });

  describe("getActiveCourseCount", () => {
    it("should return the count of active courses", async () => {
      vi.mocked(mockRepo.countActiveByUserId).mockResolvedValue(4);

      const count = await service.getActiveCourseCount("user-456");

      expect(count).toBe(4);
      expect(mockRepo.countActiveByUserId).toHaveBeenCalledWith("user-456");
    });
  });
});
