import { userRoutes } from "./UserRoutes";
import { FastifyTypedInstance } from "@utils/types";

export const registerRoutes = (app: FastifyTypedInstance) => {
  app.register(userRoutes.init.bind(userRoutes));
};
