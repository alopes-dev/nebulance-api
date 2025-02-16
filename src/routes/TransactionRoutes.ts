import { ControllerContainer } from "@containers/ControllerContainer";
import { z } from "zod";
import { FastifyTypedInstance } from "@utils/types";
import { TransactionController } from "@controllers/TransactionController";
import { addJwtHook } from "./helpers";

class TransactionRoutes {
  private readonly prefix = "/transactions";

  constructor(private readonly controller: TransactionController) {}

  init(app: FastifyTypedInstance) {
    const transactionSchema = {
      schema: {
        tags: ["Transactions"],
        preValidation: [app.authenticate],
      },
    };

    this.getAll(app, transactionSchema);
    this.create(app, transactionSchema);
    this.analysis(app, transactionSchema);
  }

  private getAll(app: FastifyTypedInstance, transactionSchema: any) {
    app.get(
      this.prefix,
      {
        ...transactionSchema,
        schema: {
          ...transactionSchema.schema,
          description: "Get all transactions",
        },
      },
      this.controller.getAllTransactions.bind(this.controller)
    );
  }

  private create(app: FastifyTypedInstance, transactionSchema: any) {
    const createTransactionSchema = z.object({
      amount: z.number(),
      type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
      category: z.enum([
        "FOOD",
        "TRANSPORT",
        "HOUSING",
        "UTILITIES",
        "ENTERTAINMENT",
        "HEALTHCARE",
        "SHOPPING",
        "OTHERS",
      ]),
      description: z.string(),
      accountId: z.string(),
      userId: z.string(),
      date: z.string().transform((str) => new Date(str)),
    });

    app.post(
      this.prefix,
      {
        ...transactionSchema,
        schema: {
          ...transactionSchema.schema,
          description: "Create a new transaction",
          body: createTransactionSchema,
        },
      },
      this.controller.createTransaction.bind(this.controller)
    );
  }

  private analysis(app: FastifyTypedInstance, transactionSchema: any) {
    app.get(
      `${this.prefix}/analysis`,
      {
        ...transactionSchema,
        schema: {
          ...transactionSchema.schema,
          description: "Get analysis of transactions",
        },
      },
      this.controller.analysis.bind(this.controller)
    );
  }
}

export const transactionRoutes = new TransactionRoutes(
  ControllerContainer.transactionController
);
