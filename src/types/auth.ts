import { UserProfile } from "./user";

export interface AuthSession {
  user: {
    id: string;
    email: string;
  };
  profile: UserProfile | null;
}

export interface AuthResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  requiresEmailConfirmation?: boolean;
}
