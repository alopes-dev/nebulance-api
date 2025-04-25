import { ControllerContainer } from "@containers/ControllerContainer";
import { z } from "zod";
import { FastifyTypedInstance } from "@utils/types";
import { GoalsController } from "@controllers/GoalsController";

class GoalsRoutes {
  private readonly prefix = "/goals";

  constructor(private readonly controller: GoalsController) {}

  init(app: FastifyTypedInstance) {
    const goalsSchema = {
      schema: {
        tags: ["Goals"],
        preValidation: [app.authenticate],
      },
    };

    this.index(app, goalsSchema);
    this.create(app, goalsSchema);
    this.addToGoal(app, goalsSchema);
    this.withdrawFromGoal(app, goalsSchema);
    this.delete(app, goalsSchema);
    this.update(app, goalsSchema);
  }

  private index(app: FastifyTypedInstance, goalsSchema: any) {
    app.get(
      this.prefix,
      {
        ...goalsSchema,
        schema: {
          ...goalsSchema.schema,
          description: "Get all goals",
        },
      },
      this.controller.index.bind(this.controller)
    );
  }

  private create(app: FastifyTypedInstance, goalsSchema: any) {
    const createGoalSchema = z.object({
      name: z.string(),
      targetAmount: z.number(),
      deadline: z.string().transform((str) => new Date(str)),
    });

    app.post(
      this.prefix,
      {
        ...goalsSchema,
        schema: {
          ...goalsSchema.schema,
          description: "Create a new goal",
          body: createGoalSchema,
        },
      },
      this.controller.create.bind(this.controller)
    );
  }

  private update(app: FastifyTypedInstance, goalsSchema: any) {
    const updateGoalSchema = z.object({
      name: z.string(),
      targetAmount: z.number(),
      deadline: z.string().transform((str) => new Date(str)),
    });

    app.patch(
      `${this.prefix}/:goalId`,
      {
        ...goalsSchema,
        schema: {
          ...goalsSchema.schema,
          description: "Update goal",
          body: updateGoalSchema,
          params: z.object({
            goalId: z.string(),
          }),
        },
      },
      this.controller.update.bind(this.controller)
    );
  }

  private addToGoal(app: FastifyTypedInstance, goalsSchema: any) {
    const addToGoalSchema = z.object({
      amount: z.number(),
    });

    app.post(
      `${this.prefix}/:goalId/add`,
      {
        ...goalsSchema,
        schema: {
          ...goalsSchema.schema,
          description: "Add amount to goal",
          body: addToGoalSchema,
          params: z.object({
            goalId: z.string(),
          }),
        },
      },
      this.controller.addToGoal.bind(this.controller)
    );
  }

  private withdrawFromGoal(app: FastifyTypedInstance, goalsSchema: any) {
    const withdrawFromGoalSchema = z.object({
      amount: z.number(),
    });

    app.post(
      `${this.prefix}/:goalId/withdraw`,
      {
        ...goalsSchema,
        schema: {
          ...goalsSchema.schema,
          description: "Withdraw amount from goal",
          body: withdrawFromGoalSchema,
          params: z.object({
            goalId: z.string(),
          }),
        },
      },
      this.controller.withdrawFromGoal.bind(this.controller)
    );
  }

  private delete(app: FastifyTypedInstance, goalsSchema: any) {
    app.delete(
      `${this.prefix}/:goalId`,
      {
        ...goalsSchema,
        schema: {
          ...goalsSchema.schema,
          description: "Delete goal",
        },
      },
      this.controller.delete.bind(this.controller)
    );
  }
}

export const goalsRoutes = new GoalsRoutes(ControllerContainer.goalsController);
