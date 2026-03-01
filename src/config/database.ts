import { PrismaClient } from '../generated/prisma';

export const prisma = new PrismaClient();

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
