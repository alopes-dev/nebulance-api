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

  async processPDF(
    req: FastifyRequest<{
      Body: {
        file: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const userFromToken = await getUserFromToken(req);

      if (!userFromToken) {
        return reply.status(401).send({
          error: "Unauthorized",
        });
      }

      const { file } = req.body;

      if (!file) {
        return reply.status(400).send({
          error: "Missing required fields: file",
        });
      }

      const buffer = Buffer.from(file, "base64");

      const transactions = await this.service.processPDFService(
        buffer,
        userFromToken?.id
      );

      reply.send({
        message: "PDF processed successfully",
        transactions,
      });
    } catch (error) {
      console.error("Error processing PDF:", error);
      reply.status(500).send({
        error: "Failed to process PDF",
      });
    }
  }
}
