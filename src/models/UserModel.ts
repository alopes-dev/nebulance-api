import { PrismaClient } from "@prisma/client";
import { IUser } from "@utils/types";

const prisma = new PrismaClient();

export class UserModel {
  static async getAll() {
    return prisma.user.findMany();
  }

  static async getById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  static async create(payload: Omit<IUser, "id">) {
    return prisma.user.create({ data: payload });
  }

  static async update(id: string, payload: Partial<IUser>) {
    return prisma.user.update({
      where: { id },
      data: payload,
      select: { id: true },
    });
  }

  static async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }

  static async me(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
