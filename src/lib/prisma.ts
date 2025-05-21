import { PrismaClient } from "@prisma/client";

// Define a proper type for the global Prisma instance
type GlobalWithPrisma = typeof globalThis & {
 prisma?: PrismaClient;
};

// Prevent multiple instances of Prisma Client in development
const globalForPrisma: GlobalWithPrisma = global as unknown as GlobalWithPrisma;

export const prisma =
 globalForPrisma.prisma ||
 new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
 });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
