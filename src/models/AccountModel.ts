import { PrismaClient } from "@prisma/client";
import { IAccount } from "@utils/types";

const prisma = new PrismaClient();

export class AccountModel {
  static async getAll() {
    return prisma.account.findMany();
  }

  static async getById(id: string) {
    return prisma.account.findUnique({ where: { id } });
  }

  static async getByUserId(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }
    const account = await prisma.account.findFirst({
      where: { userId: user.id },
    });
    if (!account) {
      throw new Error("Account not found");
    }
    return {
      ...account,
      onboardingStatus: user.onboardingStatus,
    };
  }

  static async create(payload: Omit<IAccount, "id">) {
    return prisma.account.create({
      data: {
        balance: payload.balance,
        name: payload.name,
        type: payload.type,
        userId: payload.userId,
        monthlyExpenses: payload.monthlyExpenses,
      },
    });
  }

  static async update(id: string, payload: Partial<IAccount>) {
    return prisma.account.update({
      where: { id },
      data: {
        balance: payload.balance,
        name: payload.name,
        type: payload.type,
        userId: payload.userId,
        monthlyExpenses: payload.monthlyExpenses,
      },
      select: { id: true },
    });
  }

  static async delete(id: string) {
    return prisma.account.delete({ where: { id } });
  }
}
