import { UserService } from "@services/UserService";
import { UserModel } from "@models/UserModel";

export const ServiceContainer = {
  userService: new UserService(UserModel),
};
