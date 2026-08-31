import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserService } from "../user.service";
import { IUserRepository } from "@/repositories/user.repository";
import { UserProfile } from "@/types/user";

describe("UserService", () => {
  let mockUserRepo: IUserRepository;
  let userService: UserService;

  const sampleProfile: UserProfile = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    email: "student@university.edu",
    fullName: "Carlos Pérez",
    avatarUrl: null,
    role: "STUDENT",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockUserRepo = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };
    userService = new UserService(mockUserRepo);
  });

  describe("getProfile", () => {
    it("should return the user profile when found", async () => {
      vi.mocked(mockUserRepo.findById).mockResolvedValue(sampleProfile);

      const profile = await userService.getProfile(sampleProfile.id);
      expect(profile).toEqual(sampleProfile);
      expect(mockUserRepo.findById).toHaveBeenCalledWith(sampleProfile.id);
    });

    it("should return null when user is not found", async () => {
      vi.mocked(mockUserRepo.findById).mockResolvedValue(null);

      const profile = await userService.getProfile("non-existent-id");
      expect(profile).toBeNull();
    });
  });

  describe("updateProfile", () => {
    it("should update profile successfully when user exists", async () => {
      vi.mocked(mockUserRepo.findById).mockResolvedValue(sampleProfile);
      const updatedProfile = { ...sampleProfile, fullName: "Carlos Alberto Pérez" };
      vi.mocked(mockUserRepo.update).mockResolvedValue(updatedProfile);

      const result = await userService.updateProfile(sampleProfile.id, {
        fullName: "Carlos Alberto Pérez",
      });

      expect(result.success).toBe(true);
      expect(result.data?.fullName).toBe("Carlos Alberto Pérez");
      expect(mockUserRepo.update).toHaveBeenCalledWith(sampleProfile.id, {
        fullName: "Carlos Alberto Pérez",
      });
    });

    it("should return error when user to update is not found", async () => {
      vi.mocked(mockUserRepo.findById).mockResolvedValue(null);

      const result = await userService.updateProfile("non-existent-id", {
        fullName: "New Name",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Perfil no encontrado");
      expect(mockUserRepo.update).not.toHaveBeenCalled();
    });
  });
});
