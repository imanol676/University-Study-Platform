import { requestCache } from "@/lib/cache";
import {
  ICourseRepository,
  courseRepository,
} from "@/repositories/course.repository";
import { Course } from "@/types/course";
import {
  CreateCourseInput,
  UpdateCourseInput,
} from "@/features/course/schemas/course.schema";

export interface ICourseService {
  getCourses(
    userId: string,
    options?: { includeArchived?: boolean }
  ): Promise<Course[]>;
  getCourseById(userId: string, courseId: string): Promise<Course | null>;
  createCourse(userId: string, input: CreateCourseInput): Promise<Course>;
  updateCourse(
    userId: string,
    courseId: string,
    input: UpdateCourseInput
  ): Promise<Course>;
  deleteCourse(userId: string, courseId: string): Promise<void>;
  archiveCourse(
    userId: string,
    courseId: string,
    isArchived: boolean
  ): Promise<Course>;
  getActiveCourseCount(userId: string): Promise<number>;
}

export class CourseService implements ICourseService {
  constructor(
    private readonly repository: ICourseRepository = courseRepository
  ) {}

  async getCourses(
    userId: string,
    options?: { includeArchived?: boolean }
  ): Promise<Course[]> {
    if (!userId) {
      throw new Error("El ID de usuario es obligatorio");
    }
    return this.repository.findAllByUserId(userId, options);
  }

  getCourseById = requestCache(
    async (userId: string, courseId: string): Promise<Course | null> => {
      if (!userId || !courseId) {
        return null;
      }
      const course = await this.repository.findById(courseId);
      if (!course || course.userId !== userId) {
        return null;
      }
      return course;
    }
  );

  async createCourse(
    userId: string,
    input: CreateCourseInput
  ): Promise<Course> {
    if (!userId) {
      throw new Error("El ID de usuario es obligatorio");
    }
    if (!input.name || input.name.trim().length < 2) {
      throw new Error("El nombre de la materia debe tener al menos 2 caracteres");
    }
    return this.repository.create(userId, input);
  }

  async updateCourse(
    userId: string,
    courseId: string,
    input: UpdateCourseInput
  ): Promise<Course> {
    const existing = await this.repository.findById(courseId);
    if (!existing || existing.userId !== userId) {
      throw new Error("Materia no encontrada o no autorizada");
    }

    return this.repository.update(courseId, input);
  }

  async deleteCourse(userId: string, courseId: string): Promise<void> {
    const existing = await this.repository.findById(courseId);
    if (!existing || existing.userId !== userId) {
      throw new Error("Materia no encontrada o no autorizada");
    }

    await this.repository.delete(courseId);
  }

  async archiveCourse(
    userId: string,
    courseId: string,
    isArchived: boolean
  ): Promise<Course> {
    const existing = await this.repository.findById(courseId);
    if (!existing || existing.userId !== userId) {
      throw new Error("Materia no encontrada o no autorizada");
    }

    return this.repository.update(courseId, { isArchived });
  }

  getActiveCourseCount = requestCache(async (userId: string): Promise<number> => {
    if (!userId) {
      return 0;
    }
    return this.repository.countActiveByUserId(userId);
  });
}

export const courseService = new CourseService();
