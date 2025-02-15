import { FastifyInstance, FastifyRequest } from "fastify";
import { UserController } from "@controllers/UserController";
import { ControllerContainer } from "@containers/ControllerContainer";
import { z } from "zod";
import { FastifyTypedInstance, IUser } from "@utils/types";

class UserRoutes {
  private readonly prefix = "/users";

  constructor(private readonly controller: UserController) {}

  init(app: FastifyTypedInstance) {
    const userSchema = {
      schema: {
        tags: ["users"],
      },
    };

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

    app.post(
      this.prefix,
      {
        ...userSchema,
        schema: {
          ...userSchema.schema,
          description: "Create a new user",
          body: z.object({
            name: z.string(),
            email: z.string(),
            phoneNumber: z.string(),
          }),
        },
      },
      this.controller.createUser.bind(this.controller)
    );
  }
}

export const userRoutes = new UserRoutes(ControllerContainer.userController);
