import { UserModel } from "@models/UserModel";
import { IUser } from "@utils/types";

export class UserService {
  private readonly model: typeof UserModel;

  constructor(model: typeof UserModel) {
    this.model = model;
  }

  async getAllUsers() {
    return this.model.getAll();
  }

  async createUser(payload: IUser) {
    return this.model.create(payload);
  }
}
