import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "../Sidebar";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("Sidebar Component", () => {
  const sampleUser = {
    email: "student@university.edu",
    fullName: "Lucía Fernández",
    avatarUrl: null,
  };

  it("should render brand name and navigation items", () => {
    render(<Sidebar user={sampleUser} />);

    expect(screen.getByText("Study Platform")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Materias")).toBeInTheDocument();
    expect(screen.getByText("Progreso")).toBeInTheDocument();
    expect(screen.getByText("Configuración")).toBeInTheDocument();
  });

  it("should render user information in UserNav", () => {
    render(<Sidebar user={sampleUser} />);

    expect(screen.getByText("Lucía Fernández")).toBeInTheDocument();
    expect(screen.getByText("student@university.edu")).toBeInTheDocument();
  });
});
