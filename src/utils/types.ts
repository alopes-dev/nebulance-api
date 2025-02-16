import { AccountType, Category, TransactionType } from "@prisma/client";
import {
  FastifyBaseLogger,
  FastifyInstance,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export type FastifyTypedInstance = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  FastifyBaseLogger,
  ZodTypeProvider
>;

export interface IUser {
  id?: string;
  name: string;
  email: string;
  password: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAccount {
  id?: string;
  name: string;
  type: AccountType;
  balance: number;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ITransaction {
  id?: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: string;
  description?: string;
  accountId: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface JWTPayload {
  email: string;
  name: string;
  id: string;
}

export interface IAuth extends Pick<IUser, "email" | "password"> {}
