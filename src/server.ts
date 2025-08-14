import { buildApp } from './app';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { config } from './config/environment';

const start = async (): Promise<void> => {
  try {
    // Connect to databases first
    console.log('🔄 Connecting to databases...');
    
    // Connect to PostgreSQL
    await connectDatabase();
    
    // Connect to Redis
    await connectRedis();
    
    // Build and start the app
    const app = await buildApp();
    
    await app.listen({ port: config.port, host: config.host });
    
    console.log(`🚀 PropDocs API server listening on http://${config.host}:${config.port}`);
    console.log(`📊 Health check: http://${config.host}:${config.port}/health`);
    console.log(`✅ Ready check: http://${config.host}:${config.port}/ready`);
    console.log(`🗃️ Database: PostgreSQL connected`);
    console.log(`📦 Cache: Redis connected`);
    
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

start();