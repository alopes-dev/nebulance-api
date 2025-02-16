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

  async createAccount(payload: IAccount) {
    return this.model.create(payload);
  }
}
