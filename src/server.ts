import { buildApp } from './app';
import { connectDatabase } from './config/database';
import { config } from './config/environment';

const start = async (): Promise<void> => {
  try {
    console.log('Connecting to database...');
    await connectDatabase();

    const app = await buildApp();

    await app.listen({ port: config.port, host: config.host });

    console.log(
      `PropDocs API server listening on http://${config.host}:${config.port}`
    );
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

process.on('SIGINT', () => {
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.exit(0);
});

start();
