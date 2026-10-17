import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  try {
    return (
      global.prisma ||
      new PrismaClient({
        log: ["warn", "error"],
      })
    );
  } catch (error) {
    console.warn("⚠️ Prisma client could not initialize with DATABASE_URL, using fallback mode:", error);
    return new PrismaClient();
  }
}

export const prisma = createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
