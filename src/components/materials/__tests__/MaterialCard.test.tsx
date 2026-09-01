import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MaterialCard } from "../MaterialCard";
import { Material } from "@/types/material";

describe("MaterialCard", () => {
  const samplePdfMaterial: Material = {
    id: "mat-1",
    courseId: "course-1",
    userId: "user-1",
    title: "Sistemas Operativos - Unidad 1.pdf",
    description: "Resumen de procesos e hilos",
    type: "PDF",
    status: "READY",
    r2Key: "users/user-1/courses/course-1/materials/mat-1/so.pdf",
    fileSize: 4.2 * 1024 * 1024,
    mimeType: "application/pdf",
    textContent: null,
    errorMessage: null,
    createdAt: new Date("2026-03-15T12:00:00Z"),
    updatedAt: new Date("2026-03-15T12:00:00Z"),
  };

  const sampleNoteMaterial: Material = {
    id: "mat-2",
    courseId: "course-1",
    userId: "user-1",
    title: "Apuntes Clase 2",
    description: null,
    type: "NOTE",
    status: "READY",
    r2Key: "users/user-1/courses/course-1/materials/mat-2/note.md",
    fileSize: 1024,
    mimeType: "text/markdown",
    textContent: "Contenido de la clase 2",
    errorMessage: null,
    createdAt: new Date("2026-03-16T12:00:00Z"),
    updatedAt: new Date("2026-03-16T12:00:00Z"),
  };

  it("debe renderizar el título, descripción y tamaño formateado de un PDF", () => {
    render(
      <MaterialCard
        material={samplePdfMaterial}
        onDelete={vi.fn()}
      />
    );

    expect(
      screen.getByText("Sistemas Operativos - Unidad 1.pdf")
    ).toBeInTheDocument();
    expect(screen.getByText("Resumen de procesos e hilos")).toBeInTheDocument();
    expect(screen.getByText("4.2 MB")).toBeInTheDocument();
    expect(screen.getByText("Descargar")).toBeInTheDocument();
  });

  it("debe renderizar el botón 'Ver nota' para un material de tipo NOTE", () => {
    const handleViewNote = vi.fn();

    render(
      <MaterialCard
        material={sampleNoteMaterial}
        onDelete={vi.fn()}
        onViewNote={handleViewNote}
      />
    );

    expect(screen.getByText("Apuntes Clase 2")).toBeInTheDocument();
    const viewButton = screen.getByText("Ver nota");
    expect(viewButton).toBeInTheDocument();

    fireEvent.click(viewButton);
    expect(handleViewNote).toHaveBeenCalledWith(sampleNoteMaterial);
  });

  it("debe invocar onDelete al presionar el botón de eliminar", () => {
    const handleDelete = vi.fn();

    render(
      <MaterialCard
        material={samplePdfMaterial}
        onDelete={handleDelete}
      />
    );

    const deleteBtn = screen.getByTitle("Eliminar material");
    fireEvent.click(deleteBtn);

    expect(handleDelete).toHaveBeenCalledWith(samplePdfMaterial);
  });
});
