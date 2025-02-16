import "@fastify/jwt";
import { JWTPayload } from "@utils/types";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: any;
  }
  export interface FastifyRequest {
    user: JWTPayload;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: JWTPayload;
  }
}
