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
    // check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (existingUser) {
      throw new Error("User already exists with this email");
    }
    return prisma.user.create({ data: payload });
  }
}
