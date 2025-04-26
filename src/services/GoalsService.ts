import { GoalsModel } from "@models/GoalsModel";
import { IGoal } from "@utils/types";

export class GoalsService {
  private readonly model: typeof GoalsModel;

  constructor(model: typeof GoalsModel) {
    this.model = model;
  }

  async getAllGoals(userId: string) {
    return this.model.getAll(userId);
  }

  async getGoal(goalId: string) {
    return this.model.getGoal(goalId);
  }

  async createGoal(
    payload: Omit<IGoal, "id" | "currentAmount" | "status">,
    userId: string
  ) {
    return this.model.create(payload, userId);
  }

  async addToGoal(goalId: string, userId: string, amount: number) {
    const goal = await this.model.getById(goalId, userId);
    if (!goal) {
      throw new Error("Goal not found");
    }
    return this.model.addAmount(goalId, amount, userId);
  }

  async withdrawFromGoal(goalId: string, userId: string, amount: number) {
    const goal = await this.model.getById(goalId, userId);
    if (!goal) {
      throw new Error("Goal not found");
    }
    return this.model.withdrawAmount(goalId, amount, userId);
  }

  async deleteGoal(goalId: string) {
    return this.model.delete(goalId);
  }

  async updateGoal(goalId: string, payload: Partial<IGoal>) {
    return this.model.update(goalId, payload);
  }
}
