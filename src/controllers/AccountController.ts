import { FastifyReply, FastifyRequest } from "fastify";
import { AccountService } from "@services/AccountService";
import { IAccount } from "@utils/types";
import { getUserFromToken } from "@routes/helpers";

export class AccountController {
  private readonly service: AccountService;

  constructor(service: AccountService) {
    this.service = service;
  }

  async index(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const accounts = await this.service.getAllAccounts();
    reply.send(accounts);
  }

  async getUserAccount(
    req: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const userFromToken = await getUserFromToken(req);
    const accounts = await this.service.getUserAccount(userFromToken?.id);
    reply.send(accounts);
  }

  async createAccount(
    req: FastifyRequest<{ Body: IAccount }>,
    reply: FastifyReply
  ): Promise<void> {
    const account = await this.service.createAccount(req.body);
    reply.send(account);
  }

  async updateAccount(
    req: FastifyRequest<{ Params: { id: string }; Body: IAccount }>,
    reply: FastifyReply
  ): Promise<void> {
    const account = await this.service.updateAccount(req.params.id, req.body);
    reply.send(account);
  }

  async deleteAccount(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const account = await this.service.deleteAccount(req.params.id);
    reply.send(account);
  }
}
