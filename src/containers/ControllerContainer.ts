import { UserController } from "@controllers/UserController";
import { ServiceContainer } from "./ServiceContainer";

export const ControllerContainer = {
  userController: new UserController(ServiceContainer.userService),
};
