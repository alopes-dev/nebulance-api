import { FastifyReply, FastifyRequest } from "fastify";
import { UserService } from "@services/UserService";
import { IUser, JWTPayload } from "@utils/types";
import { getUserFromToken } from "@routes/helpers";

export class UserController {
  private readonly service: UserService;

  constructor(service: UserService) {
    this.service = service;
  }

  async getAllUsers(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const users = await this.service.getAllUsers();
    reply.send(users);
  }
  async me(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userFromToken = await getUserFromToken(req);

    const user = await this.service.me(userFromToken?.id);
    reply.send(user);
  }
}
