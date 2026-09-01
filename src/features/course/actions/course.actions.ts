"use server";

import { revalidatePath } from "next/cache";
import { authService } from "@/services/auth/auth.service";
import { courseService } from "@/services/course/course.service";
import {
  CreateCourseSchema,
  CreateCourseInput,
  UpdateCourseSchema,
  UpdateCourseInput,
} from "@/features/course/schemas/course.schema";
import { Course } from "@/types/course";

export type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function getCoursesAction(
  includeArchived: boolean = false
): Promise<ActionResponse<Course[]>> {
  try {
    const session = await authService.getCurrentSession();
    if (!session) {
      return { success: false, error: "No autenticado" };
    }

    const courses = await courseService.getCourses(session.user.id, {
      includeArchived,
    });
    return { success: true, data: courses };
  } catch (error) {
    console.error("getCoursesAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener materias",
    };
  }
}

export async function getCourseByIdAction(
  courseId: string
): Promise<ActionResponse<Course | null>> {
  try {
    const session = await authService.getCurrentSession();
    if (!session) {
      return { success: false, error: "No autenticado" };
    }

    const course = await courseService.getCourseById(session.user.id, courseId);
    return { success: true, data: course };
  } catch (error) {
    console.error("getCourseByIdAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener la materia",
    };
  }
}

export async function createCourseAction(
  rawInput: CreateCourseInput
): Promise<ActionResponse<Course>> {
  try {
    const session = await authService.getCurrentSession();
    if (!session) {
      return { success: false, error: "No autenticado" };
    }

    const parsed = CreateCourseSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message ?? "Datos de materia inválidos",
      };
    }

    const course = await courseService.createCourse(session.user.id, parsed.data);
    revalidatePath("/courses");
    revalidatePath("/dashboard");

    return { success: true, data: course };
  } catch (error) {
    console.error("createCourseAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al crear la materia",
    };
  }
}

export async function updateCourseAction(
  courseId: string,
  rawInput: UpdateCourseInput
): Promise<ActionResponse<Course>> {
  try {
    const session = await authService.getCurrentSession();
    if (!session) {
      return { success: false, error: "No autenticado" };
    }

    const parsed = UpdateCourseSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message ?? "Datos de actualización inválidos",
      };
    }

    const course = await courseService.updateCourse(
      session.user.id,
      courseId,
      parsed.data
    );

    revalidatePath("/courses");
    revalidatePath(`/courses/${courseId}`);
    revalidatePath("/dashboard");

    return { success: true, data: course };
  } catch (error) {
    console.error("updateCourseAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al actualizar la materia",
    };
  }
}

export async function deleteCourseAction(
  courseId: string
): Promise<ActionResponse<void>> {
  try {
    const session = await authService.getCurrentSession();
    if (!session) {
      return { success: false, error: "No autenticado" };
    }

    await courseService.deleteCourse(session.user.id, courseId);

    revalidatePath("/courses");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("deleteCourseAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al eliminar la materia",
    };
  }
}

export async function archiveCourseAction(
  courseId: string,
  isArchived: boolean
): Promise<ActionResponse<Course>> {
  try {
    const session = await authService.getCurrentSession();
    if (!session) {
      return { success: false, error: "No autenticado" };
    }

    const course = await courseService.archiveCourse(
      session.user.id,
      courseId,
      isArchived
    );

    revalidatePath("/courses");
    revalidatePath(`/courses/${courseId}`);
    revalidatePath("/dashboard");

    return { success: true, data: course };
  } catch (error) {
    console.error("archiveCourseAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al archivar la materia",
    };
  }
}

export async function getActiveCourseCountAction(): Promise<
  ActionResponse<number>
> {
  try {
    const session = await authService.getCurrentSession();
    if (!session) {
      return { success: false, error: "No autenticado" };
    }

    const count = await courseService.getActiveCourseCount(session.user.id);
    return { success: true, data: count };
  } catch (error) {
    console.error("getActiveCourseCountAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al obtener el conteo de materias",
    };
  }
}
