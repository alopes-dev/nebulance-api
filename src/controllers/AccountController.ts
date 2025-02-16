import { FastifyReply, FastifyRequest } from "fastify";
import { AccountService } from "@services/AccountService";
import { IAccount } from "@utils/types";

export class AccountController {
  private readonly service: AccountService;

  constructor(service: AccountService) {
    this.service = service;
  }

  async getAllAccounts(
    req: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const accounts = await this.service.getAllAccounts();
    reply.send(accounts);
  }

  async createAccount(
    req: FastifyRequest<{ Body: IAccount }>,
    reply: FastifyReply
  ): Promise<void> {
    const account = await this.service.createAccount(req.body);
    reply.send(account);
  }
}
