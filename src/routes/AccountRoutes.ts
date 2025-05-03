import { FastifyInstance, FastifyRequest } from "fastify";
import { UserController } from "@controllers/UserController";
import { ControllerContainer } from "@containers/ControllerContainer";
import { z } from "zod";
import { FastifyTypedInstance, ITransaction } from "@utils/types";
import { AccountController } from "@controllers/AccountController";

class AccountRoutes {
  private readonly prefix = "/accounts";

  constructor(private readonly controller: AccountController) {}

  init(app: FastifyTypedInstance) {
    const accountSchema = {
      schema: {
        tags: ["Accounts"],
        preValidation: [app.authenticate],
      },
    };

    this.index(app, accountSchema);
    this.getUserAccount(app, accountSchema);
    this.create(app, accountSchema);
    this.update(app, accountSchema);
    this.delete(app, accountSchema);
  }

  private index(app: FastifyTypedInstance, accountSchema: any) {
    app.get(
      this.prefix,
      {
        ...accountSchema,
        schema: {
          ...accountSchema.schema,
          description: "Get all accounts",
        },
      },
      this.controller.index.bind(this.controller)
    );
  }

  private getUserAccount(app: FastifyTypedInstance, accountSchema: any) {
    app.get(
      `${this.prefix}/me`,
      {
        ...accountSchema,
        schema: {
          ...accountSchema.schema,
          description: "Get user account",
        },
      },
      this.controller.getUserAccount.bind(this.controller)
    );
  }

  private create(app: FastifyTypedInstance, accountSchema: any) {
    const createAccountSchema = z.object({
      name: z.string(),
      type: z.string(),
      balance: z.number(),
      monthlyExpenses: z.number(),
      currencyStyle: z.string(),
      userId: z.string(),
    });

    app.post(
      this.prefix,
      {
        ...accountSchema,
        schema: {
          ...accountSchema.schema,
          description: "Create a new account",
          body: createAccountSchema,
        },
      },
      this.controller.createAccount.bind(this.controller)
    );
  }

  private update(app: FastifyTypedInstance, accountSchema: any) {
    const updateAccountSchema = z.object({
      name: z.string(),
      type: z.string(),
      balance: z.number(),
      monthlyExpenses: z.number(),
      currencyStyle: z.string(),
      currency: z.string(),
      userId: z.string(),
    });

    app.put(
      `${this.prefix}/:id`,
      {
        ...accountSchema,
        schema: {
          ...accountSchema.schema,
          description: "Update an account",
          body: updateAccountSchema,
        },
      },
      this.controller.updateAccount.bind(this.controller)
    );
  }
  private delete(app: FastifyTypedInstance, accountSchema: any) {
    app.delete(
      `${this.prefix}/:id`,
      {
        ...accountSchema,
        schema: {
          ...accountSchema.schema,
          description: "Delete an account",
        },
      },
      this.controller.deleteAccount.bind(this.controller)
    );
  }
}

export const accountRoutes = new AccountRoutes(
  ControllerContainer.accountController
);
