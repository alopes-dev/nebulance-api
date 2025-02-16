import { UserController } from "@controllers/UserController";
import { ServiceContainer } from "./ServiceContainer";
import { TransactionController } from "@controllers/TransactionController";
import { AccountController } from "@controllers/AccountController";
import { AuthController } from "@controllers/AuthController";

export const ControllerContainer = {
  userController: new UserController(ServiceContainer.userService),
  transactionController: new TransactionController(
    ServiceContainer.transactionService
  ),
  accountController: new AccountController(ServiceContainer.accountService),
  authController: new AuthController(ServiceContainer.authService),
};
