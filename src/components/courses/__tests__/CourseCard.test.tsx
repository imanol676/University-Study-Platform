import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CourseCard } from "../CourseCard";
import { Course } from "@/types/course";

describe("CourseCard Component", () => {
  const mockCourse: Course = {
    id: "c-1",
    userId: "u-1",
    name: "Inteligencia Artificial",
    code: "IA-2026",
    description: "Modelos generativos y redes neuronales",
    term: "2do Cuatrimestre",
    color: "EMERALD",
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("should render course title, code, description and term", () => {
    render(<CourseCard course={mockCourse} />);

    expect(screen.getByText("Inteligencia Artificial")).toBeInTheDocument();
    expect(screen.getByText("IA-2026")).toBeInTheDocument();
    expect(
      screen.getByText("Modelos generativos y redes neuronales")
    ).toBeInTheDocument();
    expect(screen.getByText("2do Cuatrimestre")).toBeInTheDocument();
  });

  it("should display 'Archivada' badge when course is archived", () => {
    const archivedCourse: Course = {
      ...mockCourse,
      isArchived: true,
    };

    render(<CourseCard course={archivedCourse} />);

    expect(screen.getByText("Archivada")).toBeInTheDocument();
  });

  it("should render link pointing to course detail", () => {
    render(<CourseCard course={mockCourse} />);

    const link = screen.getByRole("link", { name: /ver materia inteligencia artificial/i });
    expect(link).toHaveAttribute("href", "/courses/c-1");
  });
});
