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
    return prisma.$transaction(async (tx) => {
      // Create the account
      const account = await tx.account.create({
        data: {
          balance: payload.balance,
          name: payload.name,
          type: payload.type,
          currencyStyle: payload.currencyStyle,
          userId: payload.userId,
          monthlyExpenses: payload.monthlyExpenses,
        },
      });

      // Get the user's current onboarding status
      const user = await tx.user.findUnique({
        where: { id: payload.userId },
        select: { onboardingStatus: true },
      });

      // If user exists and onboarding status is not COMPLETE, update to MONTHLY_BUDGET
      if (user && user.onboardingStatus !== "COMPLETE") {
        await tx.user.update({
          where: { id: payload.userId },
          data: { onboardingStatus: "MONTHLY_BUDGET" },
        });
      }

      return account;
    });
  }

  static async update(id: string, payload: Partial<IAccount>) {
    return prisma.$transaction(async (tx) => {
      // Update the account
      const account = await tx.account.update({
        where: { id },
        data: {
          balance: payload.balance,
          name: payload.name,
          type: payload.type,
          userId: payload.userId,
          monthlyExpenses: payload.monthlyExpenses,
          currencyStyle: payload.currencyStyle,
          currency: payload.currency,
        },
        select: { id: true, userId: true },
      });

      // Get the user's current onboarding status
      const user = await tx.user.findUnique({
        where: { id: account.userId },
        select: { onboardingStatus: true },
      });

      // If user exists and onboarding status is not COMPLETE, update to COMPLETE
      if (user && user.onboardingStatus !== "COMPLETE") {
        await tx.user.update({
          where: { id: account.userId },
          data: { onboardingStatus: "COMPLETE" },
        });
      }

      return account;
    });
  }

  static async delete(id: string) {
    return prisma.account.delete({ where: { id } });
  }
}
