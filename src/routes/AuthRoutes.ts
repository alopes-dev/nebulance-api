import { ControllerContainer } from "@containers/ControllerContainer";
import { z } from "zod";
import { FastifyTypedInstance, IAuth } from "@utils/types";
import { AuthController } from "@controllers/AuthController";
import { FastifyRequest } from "fastify";

class AuthRoutes {
  private readonly prefix = "";

  constructor(private readonly controller: AuthController) {}

  init(app: FastifyTypedInstance) {
    const userSchema = {
      schema: {
        tags: ["Authentication"],
      },
    };

    this.login(app, userSchema);
    this.register(app, userSchema);
  }

  private login(app: FastifyTypedInstance, userSchema: any) {
    app.post(
      `${this.prefix}/login`,
      {
        ...userSchema,
        schema: {
          ...userSchema.schema,
          description: "Login a user",
          body: z.object({
            email: z.string(),
            password: z.string(),
          }),
        },
      },
      async (request: FastifyRequest<{ Body: IAuth }>, reply) => {
        return this.controller.login(app, request, reply);
      }
    );
  }

  private register(app: FastifyTypedInstance, userSchema: any) {
    app.post(
      `${this.prefix}/register`,
      {
        ...userSchema,
        schema: {
          ...userSchema.schema,
          description: "Create a new user",
          body: z.object({
            name: z.string(),
            email: z.string(),
            password: z.string(),
          }),
        },
      },
      this.controller.register.bind(this.controller)
    );
  }
}

export const authRoutes = new AuthRoutes(ControllerContainer.authController);
