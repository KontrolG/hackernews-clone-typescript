import { PrismaClient } from "@prisma/client";

const context = {
  prisma: new PrismaClient()
};

export type Context = typeof context;

export default context;
