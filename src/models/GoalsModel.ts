import { PrismaClient, Category, TransactionType } from "@prisma/client";
import { IGoal } from "@utils/types";
import { AccountModel } from "./AccountModel";
import { TransactionModel } from "./TransactionModel";

const prisma = new PrismaClient();

export class GoalsModel {
  static async getAll(userId: string) {
    const account = await AccountModel.getByUserId(userId);

    if (!account) {
      throw new Error("Account not found");
    }

    return prisma.goal.findMany({
      where: { accountId: account.id },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getGoal(id: string) {
    return prisma.goal.findUnique({
      where: { id },
    });
  }

  static async getById(id: string, userId: string) {
    const account = await AccountModel.getByUserId(userId);

    if (!account) {
      throw new Error("Account not found");
    }

    return prisma.goal.findFirst({
      where: { id, accountId: account.id },
    });
  }

  static async create(
    payload: Omit<IGoal, "id" | "currentAmount" | "status">,
    userId: string
  ) {
    const account = await AccountModel.getByUserId(userId);

    if (!account) {
      throw new Error("Account not found");
    }

    return prisma.goal.create({
      data: {
        name: payload.name,
        targetAmount: payload.targetAmount,
        deadline: payload.deadline,
        accountId: account.id,
        currentAmount: 0,
        status: "IN_PROGRESS",
      },
    });
  }

  static async addAmount(id: string, amount: number, userId: string) {
    const goal = await prisma.goal.findUnique({
      where: { id },
      select: { currentAmount: true, targetAmount: true, accountId: true },
    });

    if (!goal) {
      throw new Error("Goal not found");
    }

    const newAmount = goal.currentAmount + amount;
    const status = newAmount >= goal.targetAmount ? "COMPLETED" : "IN_PROGRESS";

    return prisma.$transaction(async (tx) => {
      const updatedGoal = await tx.goal.update({
        where: { id },
        data: {
          currentAmount: Number(newAmount.toFixed(2)),
          status,
        },
      });

      await TransactionModel.createModel({
        amount,
        type: TransactionType.EXPENSE,
        category: Category.SAVINGS,
        description: `Added amount to goal`,
        date: new Date().toISOString(),
        accountId: goal.accountId,
        userId,
        goalId: id,
      });

      return updatedGoal;
    });
  }

  static async withdrawAmount(id: string, amount: number, userId: string) {
    const goal = await prisma.goal.findUnique({
      where: { id },
      select: { currentAmount: true, accountId: true },
    });

    if (!goal) {
      throw new Error("Goal not found");
    }

    if (goal.currentAmount < amount) {
      throw new Error("Insufficient funds in goal");
    }

    return prisma.$transaction(async (tx) => {
      const newAmount = goal.currentAmount - amount;

      const updatedGoal = await tx.goal.update({
        where: { id },
        data: {
          currentAmount: Number(newAmount.toFixed(2)),
          status: "IN_PROGRESS",
        },
      });

      await TransactionModel.createModel({
        amount,
        type: TransactionType.INCOME,
        category: Category.SAVINGS,
        description: `Withdrawn amount from goal`,
        date: new Date().toISOString(),
        accountId: goal.accountId,
        userId,
        goalId: id,
      });

      return updatedGoal;
    });
  }

  static async delete(id: string, userId: string) {
    const goal = await prisma.goal.findUnique({
      where: { id },
      select: { currentAmount: true, accountId: true },
    });

    if (!goal) {
      throw new Error("Goal not found");
    }

    return prisma.$transaction(async (tx) => {
      // Create transaction for the returned amount
      await TransactionModel.createModel({
        amount: goal.currentAmount,
        type: TransactionType.INCOME,
        category: Category.SAVINGS,
        description: `Goal deleted - amount returned to account`,
        date: new Date().toISOString(),
        accountId: goal.accountId,
        userId,
        goalId: id,
      });

      // Delete the goal
      return tx.goal.delete({
        where: { id },
      });
    });
  }

  static async update(id: string, payload: Partial<IGoal>) {
    const goal = await prisma.goal.findUnique({
      where: { id },
    });

    if (!goal) {
      throw new Error("Goal not found");
    }

    return prisma.goal.update({
      where: { id },
      data: payload,
    });
  }
}
