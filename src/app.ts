import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import { errorHandler } from './middleware/errorHandler';

export async function buildApp(): Promise<FastifyInstance> {
  const loggerConfig =
    process.env.NODE_ENV === 'development'
      ? {
          level: process.env.LOG_LEVEL || 'info',
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          },
        }
      : {
          level: process.env.LOG_LEVEL || 'info',
        };

  const app = Fastify({ logger: loggerConfig });

  app.setErrorHandler(errorHandler);

  // Plugins
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.ALLOWED_ORIGINS?.split(',') || false
        : true,
    credentials: true,
  });
  await app.register(rateLimit, {
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    timeWindow: process.env.RATE_LIMIT_WINDOW || '1 minute',
  });
  await app.register(multipart, {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  });

  // Routes
  const { healthRoutes } = await import('./routes/health');
  await app.register(healthRoutes);

  const { authRoutes } = await import('./routes/auth');
  await app.register(authRoutes);

  const { propertyRoutes } = await import('./routes/properties');
  await app.register(propertyRoutes);

  const { assetRoutes } = await import('./routes/assets');
  await app.register(assetRoutes);

  const { maintenanceRoutes } = await import('./routes/maintenance');
  await app.register(maintenanceRoutes);

  const { uploadRoutes } = await import('./routes/uploads');
  await app.register(uploadRoutes);

  return app;
}
