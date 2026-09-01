export type CourseColor =
  | "INDIGO"
  | "BLUE"
  | "EMERALD"
  | "AMBER"
  | "ROSE"
  | "PURPLE"
  | "SLATE"
  | "CYAN";

export interface Course {
  id: string;
  userId: string;
  name: string;
  code: string | null;
  description: string | null;
  term: string | null;
  color: CourseColor;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseSummary extends Course {
  documentCount?: number;
  sessionCount?: number;
}

export type CourseFilter = "active" | "archived" | "all";
