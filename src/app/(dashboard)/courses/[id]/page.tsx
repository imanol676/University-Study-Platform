import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { authService } from "@/services/auth/auth.service";
import { courseService } from "@/services/course/course.service";
import { CourseDetailView } from "@/components/courses/CourseDetailView";

interface CourseDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: CourseDetailPageProps): Promise<Metadata> {
  const session = await authService.getCurrentSession();
  if (!session) {
    return { title: "Materia | University Study Platform" };
  }

  const course = await courseService.getCourseById(session.user.id, params.id);
  if (!course) {
    return { title: "Materia no encontrada | University Study Platform" };
  }

  return {
    title: `${course.name} | University Study Platform`,
    description: course.description ?? `Espacio de estudio para ${course.name}`,
  };
}

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const session = await authService.getCurrentSession();
  if (!session) {
    redirect("/login");
  }

  const course = await courseService.getCourseById(session.user.id, params.id);
  if (!course) {
    notFound();
  }

  return <CourseDetailView initialCourse={course} />;
}
