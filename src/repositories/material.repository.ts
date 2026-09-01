import { prisma } from "@/lib/prisma";
import { Material, MaterialType } from "@/types/material";

export interface IMaterialRepository {
  findById(id: string): Promise<Material | null>;
  findAllByCourseId(courseId: string, type?: MaterialType): Promise<Material[]>;
  create(data: Omit<Material, "createdAt" | "updatedAt">): Promise<Material>;
  update(id: string, data: Partial<Material>): Promise<Material>;
  delete(id: string): Promise<void>;
  countByCourseId(courseId: string): Promise<number>;
  countAllByUserId(userId: string): Promise<number>;
}

export class MaterialRepository implements IMaterialRepository {
  async findById(id: string): Promise<Material | null> {
    const material = await prisma.material.findUnique({
      where: { id },
    });
    return (material as unknown as Material) ?? null;
  }

  async findAllByCourseId(
    courseId: string,
    type?: MaterialType
  ): Promise<Material[]> {
    const materials = await prisma.material.findMany({
      where: {
        courseId,
        ...(type ? { type } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
    return materials as unknown as Material[];
  }

  async create(
    data: Omit<Material, "createdAt" | "updatedAt">
  ): Promise<Material> {
    const material = await prisma.material.create({
      data: {
        id: data.id,
        courseId: data.courseId,
        userId: data.userId,
        title: data.title,
        description: data.description,
        type: data.type,
        status: data.status,
        r2Key: data.r2Key,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        textContent: data.textContent,
        errorMessage: data.errorMessage,
      },
    });
    return material as unknown as Material;
  }

  async update(id: string, data: Partial<Material>): Promise<Material> {
    const material = await prisma.material.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.textContent !== undefined ? { textContent: data.textContent } : {}),
        ...(data.errorMessage !== undefined ? { errorMessage: data.errorMessage } : {}),
      },
    });
    return material as unknown as Material;
  }

  async delete(id: string): Promise<void> {
    await prisma.material.delete({
      where: { id },
    });
  }

  async countByCourseId(courseId: string): Promise<number> {
    return prisma.material.count({
      where: { courseId },
    });
  }

  async countAllByUserId(userId: string): Promise<number> {
    return prisma.material.count({
      where: { userId },
    });
  }
}

export const materialRepository = new MaterialRepository();
