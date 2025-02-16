import { JWT } from "@fastify/jwt";
import { IUser, FastifyTypedInstance, JWTPayload } from "@utils/types";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export const addJwtHook = (app: FastifyInstance) => {
  app.addHook(
    "preHandler",
    async (
      request: FastifyRequest & { jwtVerify: () => Promise<JWT> },
      reply: FastifyReply
    ) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.code(401).send({ message: "Unauthorized" });
      }
    }
  );
};

export const generateToken = (
  user: Pick<IUser, "id" | "email" | "name">,
  fastify: FastifyTypedInstance
) => {
  return fastify.jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    {
      expiresIn: "1d", // Token expires in 1 day
    }
  );
};

export const getUserFromToken = async (
  request: FastifyRequest
): Promise<JWTPayload | null> => {
  const authHeader = request.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const decoded = await request.jwtVerify<JWTPayload>();
    return decoded;
  }
  return null;
};
