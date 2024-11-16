import { PrismaClient } from "@prisma/client";

type GlobalWithPrisma = typeof globalThis & {
    prisma: PrismaClient | undefined;
};

const globalForPrisma: GlobalWithPrisma = global as GlobalWithPrisma;

const prismadb = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prismadb;
}

export default prismadb;