import { PrismaClient } from "@prisma/client";

// Create a singleton instance of PrismaClient
// This is to avoid creating multiple instances of PrismaClient
const prismaClientSingleton = () => {
  return new PrismaClient();
};

// Declare a global variable to hold the Prisma Client instance
// This is to ensure that the Prisma Client is not re-instantiated in development mode
declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

// Ensure that the Prisma Client is a singleton in development mode
// This prevents the "Too many clients" error when using hot reloading in Next.js
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
