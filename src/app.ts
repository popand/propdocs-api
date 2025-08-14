import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { errorHandler } from './middleware/errorHandler';
import { setupSwagger } from './plugins/swagger';

export async function buildApp(): Promise<FastifyInstance> {
  const loggerConfig = process.env.NODE_ENV === 'development' 
    ? {
        level: process.env.LOG_LEVEL || 'info',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          }
        }
      }
    : {
        level: process.env.LOG_LEVEL || 'info',
      };

  const app = Fastify({ logger: loggerConfig });

  // Error handling
  app.setErrorHandler(errorHandler);

  // Setup Swagger documentation (only in development)
  if (process.env.NODE_ENV === 'development' || process.env.ENABLE_SWAGGER === 'true') {
    await setupSwagger(app);
  }

  // Security middleware
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  });

  // CORS configuration
  await app.register(cors, {
    origin: process.env.NODE_ENV === 'test' 
      ? ['http://localhost:3000', 'http://127.0.0.1:3000']
      : process.env.NODE_ENV === 'development' 
        ? ['http://localhost:3000', 'http://127.0.0.1:3000']
        : process.env.ALLOWED_ORIGINS?.split(',') || false,
    credentials: true,
  });

  // Rate limiting
  await app.register(rateLimit, {
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    timeWindow: process.env.RATE_LIMIT_WINDOW || '1 minute',
  });

  // Register health check routes
  await app.register(async function (fastify) {
    const { healthRoutes } = await import('./routes/health');
    await fastify.register(healthRoutes);
  });

  return app;
}