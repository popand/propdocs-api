import { PrismaClient } from '../generated/prisma';
import { config } from './environment';

// Global Prisma client instance
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.nodeEnv === 'test' 
        ? config.databaseTestUrl || config.databaseUrl
        : config.databaseUrl,
    },
  },
});

// Database connection helper
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

// Database disconnection helper
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Database disconnection failed:', error);
    throw error;
  }
}

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Graceful shutdown handler
export async function gracefulShutdown(): Promise<void> {
  console.log('🔄 Closing database connection...');
  await disconnectDatabase();
}

// Handle process signals for graceful shutdown
process.on('beforeExit', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);