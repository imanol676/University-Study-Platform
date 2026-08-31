import { userRepository, IUserRepository } from "@/repositories/user.repository";
import { UpdateUserProfileInput, UserProfile } from "@/types/user";
import { ActionResponse } from "@/types/common";

export interface IUserService {
  getProfile(userId: string): Promise<UserProfile | null>;
  updateProfile(userId: string, data: UpdateUserProfileInput): Promise<ActionResponse<UserProfile>>;
}

export class UserService implements IUserService {
  constructor(private userRepo: IUserRepository = userRepository) {}

  async getProfile(userId: string): Promise<UserProfile | null> {
    return this.userRepo.findById(userId);
  }

  async updateProfile(
    userId: string,
    data: UpdateUserProfileInput
  ): Promise<ActionResponse<UserProfile>> {
    try {
      const existing = await this.userRepo.findById(userId);
      if (!existing) {
        return {
          success: false,
          error: "Perfil no encontrado",
        };
      }

      const updated = await this.userRepo.update(userId, data);
      return {
        success: true,
        data: updated,
      };
    } catch (err) {
      console.error("UserService.updateProfile error:", err);
      return {
        success: false,
        error: "No se pudo actualizar el perfil",
      };
    }
  }
}

export const userService = new UserService();
