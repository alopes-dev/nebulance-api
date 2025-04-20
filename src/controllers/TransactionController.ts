import { FastifyReply, FastifyRequest } from "fastify";
import { TransactionService } from "@services/TransactionService";
import { ITransaction } from "@utils/types";
import { getUserFromToken } from "@routes/helpers";

export class TransactionController {
  private readonly service: TransactionService;

  constructor(service: TransactionService) {
    this.service = service;
  }

  async index(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userFromToken = await getUserFromToken(req);
    const transactions = await this.service.getAllService(userFromToken?.id);
    reply.send(transactions);
  }

  async create(
    req: FastifyRequest<{ Body: ITransaction }>,
    reply: FastifyReply
  ): Promise<void> {
    const transaction = await this.service.createService(req.body);
    reply.send(transaction);
  }

  async analysis(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userFromToken = await getUserFromToken(req);
    const analysis = await this.service.analysisService(userFromToken?.id);
    reply.send(analysis);
  }
}
