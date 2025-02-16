import { UserController } from "@controllers/UserController";
import { ControllerContainer } from "@containers/ControllerContainer";
import { z } from "zod";
import { FastifyTypedInstance } from "@utils/types";
import { addJwtHook } from "./helpers";
import { FastifyRequest } from "fastify";

class UserRoutes {
  private readonly prefix = "/users";

  constructor(private readonly controller: UserController) {}

  init(app: FastifyTypedInstance) {
    const userSchema = {
      schema: {
        tags: ["Users"],
        preValidation: [app.authenticate],
      },
    };

    this.me(app, userSchema);
    this.getAll(app, userSchema);
  }

  private getAll(app: FastifyTypedInstance, userSchema: any) {
    app.get(
      this.prefix,
      {
        ...userSchema,
        schema: {
          ...userSchema.schema,
          description: "Get all users",
        },
      },
      this.controller.getAllUsers.bind(this.controller)
    );
  }

  private me(app: FastifyTypedInstance, userSchema: any) {
    app.get(
      `/me`,
      {
        ...userSchema,
        description: "Get the current user",
      },
      // as async function
      async (request: FastifyRequest, reply) => {
        return this.controller.me(request, reply);
      }
    );
  }
}

export const userRoutes = new UserRoutes(ControllerContainer.userController);
