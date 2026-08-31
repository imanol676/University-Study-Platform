import { prisma } from "@/lib/prisma";
import { CreateUserProfileInput, UpdateUserProfileInput, UserProfile } from "@/types/user";

export interface IUserRepository {
  findById(id: string): Promise<UserProfile | null>;
  findByEmail(email: string): Promise<UserProfile | null>;
  create(data: CreateUserProfileInput): Promise<UserProfile>;
  update(id: string, data: UpdateUserProfileInput): Promise<UserProfile>;
}

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<UserProfile | null> {
    return prisma.profile.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<UserProfile | null> {
    return prisma.profile.findUnique({
      where: { email },
    });
  }

  async create(data: CreateUserProfileInput): Promise<UserProfile> {
    return prisma.profile.create({
      data: {
        id: data.id,
        email: data.email,
        fullName: data.fullName ?? null,
        avatarUrl: data.avatarUrl ?? null,
        role: data.role ?? "STUDENT",
      },
    });
  }

  async update(id: string, data: UpdateUserProfileInput): Promise<UserProfile> {
    return prisma.profile.update({
      where: { id },
      data: {
        ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
        ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
        ...(data.role !== undefined ? { role: data.role } : {}),
      },
    });
  }
}

export const userRepository = new UserRepository();
