import { PrismaClient } from "@prisma/client";
import { Request } from "express";
import { decodeAuthorizationHeader } from "./utils/auth";

const prisma = new PrismaClient();

function context({ req }: { req: Request }) {
  const user = req?.headers?.authorization
    ? decodeAuthorizationHeader(req?.headers?.authorization)
    : null;

  return {
    prisma,
    userId: user?.userId
  };
}

export type Context = ReturnType<typeof context>;

export default context;
