import { UserService } from "@services/UserService";
import { UserModel } from "@models/UserModel";
import { TransactionModel } from "@models/TransactionModel";
import { TransactionService } from "@services/TransactionService";
import { AccountModel } from "@models/AccountModel";
import { AccountService } from "@services/AccountService";
import { AuthModel } from "@models/AuthModel";
import { AuthService } from "@services/AuthService";

export const ServiceContainer = {
  userService: new UserService(UserModel),
  transactionService: new TransactionService(TransactionModel),
  accountService: new AccountService(AccountModel),
  authService: new AuthService(AuthModel),
};
