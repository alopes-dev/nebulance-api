import { FastifyReply, FastifyRequest } from "fastify";
import { TransactionService } from "@services/TransactionService";
import { ITransaction } from "@utils/types";
import { getUserFromToken } from "@routes/helpers";

export class TransactionController {
  private readonly service: TransactionService;

  constructor(service: TransactionService) {
    this.service = service;
  }

  async getAllTransactions(
    req: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const transactions = await this.service.getAllTransactions();
    reply.send(transactions);
  }

  async createTransaction(
    req: FastifyRequest<{ Body: ITransaction }>,
    reply: FastifyReply
  ): Promise<void> {
    const transaction = await this.service.createTransaction(req.body);
    reply.send(transaction);
  }

  async analysis(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userFromToken = await getUserFromToken(req);
    const analysis = await this.service.analysis(userFromToken?.id);
    reply.send(analysis);
  }
}
