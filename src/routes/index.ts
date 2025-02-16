import { accountRoutes } from "./AccountRoutes";
import { transactionRoutes } from "./TransactionRoutes";
import { userRoutes } from "./UserRoutes";
import { FastifyTypedInstance } from "@utils/types";
import { authRoutes } from "./AuthRoutes";
export const registerRoutes = (app: FastifyTypedInstance) => {
  app.register(authRoutes.init.bind(authRoutes));
  app.register(userRoutes.init.bind(userRoutes));
  app.register(transactionRoutes.init.bind(transactionRoutes));
  app.register(accountRoutes.init.bind(accountRoutes));
};
