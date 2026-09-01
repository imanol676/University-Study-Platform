import { prisma } from "@/lib/prisma";
import { Course } from "@/types/course";
import {
  CreateCourseInput,
  UpdateCourseInput,
} from "@/features/course/schemas/course.schema";

export interface ICourseRepository {
  findById(id: string): Promise<Course | null>;
  findAllByUserId(
    userId: string,
    options?: { includeArchived?: boolean }
  ): Promise<Course[]>;
  create(userId: string, data: CreateCourseInput): Promise<Course>;
  update(id: string, data: UpdateCourseInput): Promise<Course>;
  delete(id: string): Promise<void>;
  countActiveByUserId(userId: string): Promise<number>;
}

export class CourseRepository implements ICourseRepository {
  async findById(id: string): Promise<Course | null> {
    const course = await prisma.course.findUnique({
      where: { id },
    });
    return course;
  }

  async findAllByUserId(
    userId: string,
    options?: { includeArchived?: boolean }
  ): Promise<Course[]> {
    const whereClause: { userId: string; isArchived?: boolean } = { userId };
    if (!options?.includeArchived) {
      whereClause.isArchived = false;
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });
    return courses;
  }

  async create(userId: string, data: CreateCourseInput): Promise<Course> {
    const course = await prisma.course.create({
      data: {
        userId,
        name: data.name,
        code: data.code ?? null,
        description: data.description ?? null,
        term: data.term ?? null,
        color: data.color ?? "INDIGO",
      },
    });
    return course;
  }

  async update(id: string, data: UpdateCourseInput): Promise<Course> {
    const course = await prisma.course.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.code !== undefined && { code: data.code }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.term !== undefined && { term: data.term }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.isArchived !== undefined && { isArchived: data.isArchived }),
      },
    });
    return course;
  }

  async delete(id: string): Promise<void> {
    await prisma.course.delete({
      where: { id },
    });
  }

  async countActiveByUserId(userId: string): Promise<number> {
    const count = await prisma.course.count({
      where: {
        userId,
        isArchived: false,
      },
    });
    return count;
  }
}

export const courseRepository = new CourseRepository();
