import { PrismaClient } from "@prisma/client";
import { ITransaction, IUser } from "@utils/types";

const prisma = new PrismaClient();

export class TransactionModel {
  static async getAll() {
    return prisma.transaction.findMany();
  }

  static async getById(id: string) {
    return prisma.transaction.findUnique({ where: { id } });
  }

  static async create(payload: Omit<ITransaction, "id">) {
    return prisma.transaction.create({
      data: {
        amount: payload.amount,
        type: payload.type,
        category: payload.category,
        description: payload.description,
        date: new Date(payload.date),
        accountId: payload.accountId,
        userId: payload.userId,
      },
    });
  }

  static async update(id: string, payload: Partial<ITransaction>) {
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

  static async delete(id: string) {
    return prisma.transaction.delete({ where: { id } });
  }
}
