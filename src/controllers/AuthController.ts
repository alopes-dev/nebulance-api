import fastify, { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "@services/AuthService";
import { FastifyTypedInstance, IAuth, IUser } from "@utils/types";

export class AuthController {
  private readonly service: AuthService;

  constructor(service: AuthService) {
    this.service = service;
  }

  async login(
    app: FastifyTypedInstance,
    req: FastifyRequest<{ Body: IAuth }>,
    reply: FastifyReply
  ): Promise<void> {
    const { user, token } = await this.service.login(req.body, app);

    reply.send({ token, user });
  }

  async register(
    req: FastifyRequest<{ Body: IUser }>,
    reply: FastifyReply
  ): Promise<void> {
    const user = await this.service.register(req.body);
    reply.send(user);
  }
}
