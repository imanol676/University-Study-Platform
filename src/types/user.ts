export type UserRole = "STUDENT" | "ADMIN";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserProfileInput {
  id: string;
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  role?: UserRole;
}

export interface UpdateUserProfileInput {
  fullName?: string | null;
  avatarUrl?: string | null;
  role?: UserRole;
}
