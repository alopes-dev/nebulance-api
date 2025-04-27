import { FastifyReply, FastifyRequest } from "fastify";
import { GoalsService } from "@services/GoalsService";
import { getUserFromToken } from "@routes/helpers";
import { IGoal } from "@utils/types";

export class GoalsController {
  private readonly service: GoalsService;

  constructor(service: GoalsService) {
    this.service = service;
  }

  async index(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const userFromToken = await getUserFromToken(req);
      const goals = await this.service.getAllGoals(userFromToken?.id);
      reply.send(goals);
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  }

  async getGoal(
    req: FastifyRequest<{ Params: { goalId: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { goalId } = req.params;
      const goal = await this.service.getGoal(goalId);
      reply.send(goal);
    } catch (error) {
      if (error.message === "Goal not found") {
        reply.status(404).send({ error: "Goal not found" });
      } else {
        reply.status(500).send({ error: "Failed to get goal" });
      }
    }
  }

  async create(
    req: FastifyRequest<{
      Body: Pick<IGoal, "name" | "targetAmount" | "deadline" | "accountId">;
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const userFromToken = await getUserFromToken(req);
      const goal = await this.service.createGoal(req.body, userFromToken?.id);
      reply.status(201).send(goal);
    } catch (error) {
      reply.status(500).send({ error: "Failed to create goal" });
    }
  }

  async update(
    req: FastifyRequest<{
      Body: Pick<IGoal, "name" | "targetAmount" | "deadline">;
      Params: { goalId: string };
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { goalId } = req.params;
      const { name, targetAmount, deadline } = req.body;

      const goal = await this.service.updateGoal(goalId, {
        name,
        targetAmount,
        deadline,
      });
      reply.send(goal);
    } catch (error) {
      reply.status(500).send({ error: "Failed to update goal" });
    }
  }

  async addToGoal(
    req: FastifyRequest<{
      Body: { amount: number };
      Params: { goalId: string };
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const userFromToken = await getUserFromToken(req);
      const { goalId } = req.params;
      const { amount } = req.body;

      const goal = await this.service.addToGoal(
        goalId,
        userFromToken?.id,
        amount
      );
      reply.send(goal);
    } catch (error) {
      if (error.message === "Goal not found") {
        reply.status(404).send({ error: "Goal not found" });
      } else {
        reply.status(500).send({ error: "Failed to add to goal" });
      }
    }
  }

  async withdrawFromGoal(
    req: FastifyRequest<{
      Body: { amount: number };
      Params: { goalId: string };
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const userFromToken = await getUserFromToken(req);
      const { goalId } = req.params;
      const { amount } = req.body;

      const goal = await this.service.withdrawFromGoal(
        goalId,
        userFromToken?.id,
        amount
      );
      reply.send(goal);
    } catch (error) {
      if (error.message === "Goal not found") {
        reply.status(404).send({ error: "Goal not found" });
      } else if (error.message === "Insufficient funds in goal") {
        reply.status(400).send({ error: "Insufficient funds in goal" });
      } else {
        reply.status(500).send({ error: "Failed to withdraw from goal" });
      }
    }
  }

  async delete(
    req: FastifyRequest<{ Params: { goalId: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { goalId } = req.params;
      const userFromToken = await getUserFromToken(req);
      await this.service.deleteGoal(goalId, userFromToken?.id);
      reply.status(204).send();
    } catch (error) {
      reply.status(500).send({ error: "Failed to delete goal" });
    }
  }
}
