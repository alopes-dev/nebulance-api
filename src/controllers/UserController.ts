import { FastifyReply, FastifyRequest } from "fastify";
import { UserService } from "@services/UserService";
import { IUser } from "@utils/types";

export class UserController {
  private readonly service: UserService;

  constructor(service: UserService) {
    this.service = service;
  }

  async getAllUsers(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const users = await this.service.getAllUsers();
    reply.send(users);
  }

  async createUser(
    req: FastifyRequest<{ Body: IUser }>,
    reply: FastifyReply
  ): Promise<void> {
    const user = await this.service.createUser(req.body);
    reply.send(user);
  }
}
