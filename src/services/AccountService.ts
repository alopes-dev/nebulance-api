import { AccountModel } from "@models/AccountModel";
import { IAccount } from "@utils/types";

export class AccountService {
  private readonly model: typeof AccountModel;

  constructor(model: typeof AccountModel) {
    this.model = model;
  }

  async getAllAccounts() {
    return this.model.getAll();
  }

  async getUserAccount(userId: string) {
    return this.model.getByUserId(userId);
  }

  async createAccount(payload: IAccount) {
    return this.model.create(payload);
  }

  async updateAccount(id: string, payload: Partial<IAccount>) {
    return this.model.update(id, payload);
  }

  async deleteAccount(id: string) {
    return this.model.delete(id);
  }
}
