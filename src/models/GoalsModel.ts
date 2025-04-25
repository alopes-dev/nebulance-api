import { PrismaClient } from "@prisma/client";
import { IGoal } from "@utils/types";
import { AccountModel } from "./AccountModel";

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

  static async addAmount(id: string, amount: number) {
    const goal = await prisma.goal.findUnique({
      where: { id },
      select: { currentAmount: true, targetAmount: true },
    });

    if (!goal) {
      throw new Error("Goal not found");
    }

    const newAmount = goal.currentAmount + amount;
    const status = newAmount >= goal.targetAmount ? "COMPLETED" : "IN_PROGRESS";

    return prisma.goal.update({
      where: { id },
      data: {
        currentAmount: newAmount,
        status,
      },
    });
  }

  static async withdrawAmount(id: string, amount: number) {
    const goal = await prisma.goal.findUnique({
      where: { id },
      select: { currentAmount: true },
    });

    if (!goal) {
      throw new Error("Goal not found");
    }

    if (goal.currentAmount < amount) {
      throw new Error("Insufficient funds in goal");
    }

    return prisma.goal.update({
      where: { id },
      data: {
        currentAmount: goal.currentAmount - amount,
        status: "IN_PROGRESS",
      },
    });
  }

  static async delete(id: string) {
    const goal = await prisma.goal.findUnique({
      where: { id },
    });

    if (!goal) {
      throw new Error("Goal not found");
    }

    return prisma.goal.delete({
      where: { id },
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
