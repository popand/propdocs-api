import { FastifyInstance } from 'fastify';
import { successResponse } from '../utils/response';
import { StatusCodes } from 'http-status-codes';

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health', async (_request, reply) => {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };

    return successResponse(reply, healthData, 'System is healthy');
  });

  fastify.get('/ready', async (_request, reply) => {
    try {
      const { checkDatabaseHealth } = await import('../config/database');

      const startTime = Date.now();
      const dbHealthy = await checkDatabaseHealth();
      const dbLatency = Date.now() - startTime;

      const readinessData = {
        status: dbHealthy ? ('healthy' as const) : ('unhealthy' as const),
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
          status: dbHealthy ? ('connected' as const) : ('error' as const),
          latency: dbLatency,
        },
      };

      const statusCode = dbHealthy
        ? StatusCodes.OK
        : StatusCodes.SERVICE_UNAVAILABLE;
      const message = dbHealthy ? 'System is ready' : 'System is not ready';

      return successResponse(reply, readinessData, message, statusCode);
    } catch (error) {
      reply.log.error({ error }, 'Ready check failed');

      return reply.status(StatusCodes.SERVICE_UNAVAILABLE).send({
        success: false,
        data: {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          database: { status: 'error' },
        },
        message: 'Ready check failed',
        timestamp: new Date().toISOString(),
      });
    }
  });
}
