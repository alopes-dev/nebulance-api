import { TransactionModel } from "@models/TransactionModel";
import { ITransaction } from "@utils/types";

export class TransactionService {
  private readonly model: typeof TransactionModel;

  constructor(model: typeof TransactionModel) {
    this.model = model;
  }

  async getAllTransactions() {
    return this.model.getAll();
  }

  async createTransaction(payload: ITransaction) {
    return this.model.create(payload);
  }

  async analysis(userId: string) {
    return this.model.analysis(userId);
  }
}
