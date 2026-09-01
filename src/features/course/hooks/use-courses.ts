"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCoursesAction,
  getCourseByIdAction,
  createCourseAction,
  updateCourseAction,
  deleteCourseAction,
  archiveCourseAction,
  getActiveCourseCountAction,
} from "@/features/course/actions/course.actions";
import {
  CreateCourseInput,
  UpdateCourseInput,
} from "@/features/course/schemas/course.schema";
import { Course } from "@/types/course";

export function useCourses(options?: { includeArchived?: boolean }) {
  const includeArchived = options?.includeArchived ?? false;

  return useQuery<Course[]>({
    queryKey: ["courses", { includeArchived }],
    queryFn: async () => {
      const result = await getCoursesAction(includeArchived);
      if (!result.success || !result.data) {
        throw new Error(result.error ?? "No se pudieron obtener las materias");
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useCourse(courseId: string) {
  return useQuery<Course | null>({
    queryKey: ["courses", courseId],
    queryFn: async () => {
      if (!courseId) return null;
      const result = await getCourseByIdAction(courseId);
      if (!result.success) {
        throw new Error(result.error ?? "No se pudo obtener la materia");
      }
      return result.data ?? null;
    },
    enabled: !!courseId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useActiveCourseCount() {
  return useQuery<number>({
    queryKey: ["active-course-count"],
    queryFn: async () => {
      const result = await getActiveCourseCountAction();
      if (!result.success || result.data === undefined) {
        throw new Error(result.error ?? "No se pudo obtener el conteo de materias");
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCourseInput) => {
      const result = await createCourseAction(data);
      if (!result.success || !result.data) {
        throw new Error(result.error ?? "No se pudo crear la materia");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["active-course-count"] });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCourseInput;
    }) => {
      const result = await updateCourseAction(id, data);
      if (!result.success || !result.data) {
        throw new Error(result.error ?? "No se pudo actualizar la materia");
      }
      return result.data;
    },
    onSuccess: (updatedCourse) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["courses", updatedCourse.id] });
      queryClient.invalidateQueries({ queryKey: ["active-course-count"] });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const result = await deleteCourseAction(courseId);
      if (!result.success) {
        throw new Error(result.error ?? "No se pudo eliminar la materia");
      }
      return courseId;
    },
    onSuccess: (courseId) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["courses", courseId] });
      queryClient.invalidateQueries({ queryKey: ["active-course-count"] });
    },
  });
}

export function useArchiveCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      isArchived,
    }: {
      id: string;
      isArchived: boolean;
    }) => {
      const result = await archiveCourseAction(id, isArchived);
      if (!result.success || !result.data) {
        throw new Error(
          result.error ??
            (isArchived
              ? "No se pudo archivar la materia"
              : "No se pudo desarchivar la materia")
        );
      }
      return result.data;
    },
    onSuccess: (course) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["courses", course.id] });
      queryClient.invalidateQueries({ queryKey: ["active-course-count"] });
    },
  });
}
