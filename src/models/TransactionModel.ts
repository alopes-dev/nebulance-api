import { PrismaClient } from "@prisma/client";
import { ITransaction } from "@utils/types";

const prisma = new PrismaClient();

export class TransactionModel {
  static async getAllModel(userId: string) {
    return prisma.transaction.findMany({ where: { userId } });
  }

  static async getOneModel(id: string) {
    return prisma.transaction.findUnique({ where: { id } });
  }

  static async getByUserIdModel(userId: string) {
    return prisma.transaction.findMany({
      where: { userId },
      select: {
        description: true,
        amount: true,
        category: true,
        date: true,
      },
      orderBy: {
        date: "desc",
      },
    });
  }

  static async createModel(payload: Omit<ITransaction, "id">) {
    return prisma.$transaction(async (tx) => {
      // Create the transaction
      const transaction = await tx.transaction.create({
        data: {
          amount: payload.amount,
          type: payload.type,
          category: payload.category,
          description: payload.description,
          date: new Date(payload.date),
          accountId: payload.accountId,
          userId: payload.userId,
          goalId: payload.goalId,
        },
      });

      // Get the current account balance
      const account = await tx.account.findUnique({
        where: { id: payload.accountId },
        select: { balance: true },
      });

      if (!account) {
        throw new Error("Account not found");
      }

      // Update the account balance based on transaction type
      const newBalance =
        payload.type === "INCOME"
          ? account.balance + payload.amount
          : account.balance - payload.amount;

      await tx.account.update({
        where: { id: payload.accountId },
        data: { balance: newBalance },
      });

      return transaction;
    });
  }

  static async updateModel(id: string, payload: Partial<ITransaction>) {
    return prisma.transaction.update({
      where: { id },
      data: {
        amount: payload.amount,
        type: payload.type,
        category: payload.category,
        description: payload.description,
        date: new Date(payload.date),
        accountId: payload.accountId,
        userId: payload.userId,
      },
      select: { id: true },
    });
  }

  static async analysis(userId: string) {
    return prisma.transaction.groupBy({
      by: ["category"],
      where: {
        userId,
        type: "EXPENSE",
        date: {
          gte: new Date(new Date().setDate(1)), // Início do mês atual
        },
      },
      _sum: {
        amount: true,
      },
    });
  }

  static async deleteModel(id: string) {
    return prisma.transaction.delete({ where: { id } });
  }
}
