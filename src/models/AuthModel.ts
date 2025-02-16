import { PrismaClient } from "@prisma/client";
import { IAuth, IUser } from "@utils/types";

const prisma = new PrismaClient();

export class AuthModel {
  static async login(payload: IAuth) {
    return await prisma.user.findUnique({
      where: { email: payload.email },
    });
  }

  static async register(payload: IUser) {
    return prisma.user.create({ data: payload });
  }
}
