import { FastifyInstance } from 'fastify';
import { successResponse } from '../utils/response';
import { StatusCodes } from 'http-status-codes';

export async function healthRoutes(fastify: FastifyInstance) {
  // Health check endpoint
  fastify.get('/health', {
    schema: {
      tags: ['Health'],
      description: 'Basic health check endpoint',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                timestamp: { type: 'string' },
                uptime: { type: 'number' },
                memory: {
                  type: 'object',
                  properties: {
                    rss: { type: 'number' },
                    heapTotal: { type: 'number' },
                    heapUsed: { type: 'number' },
                    external: { type: 'number' },
                    arrayBuffers: { type: 'number' },
                  },
                },
              },
            },
            timestamp: { type: 'string' },
          },
        },
      },
    },
  }, async (_request, reply) => {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };

    return successResponse(reply, healthData, 'System is healthy');
  });

  // Ready check endpoint with database connectivity
  fastify.get('/ready', {
    schema: {
      tags: ['Health'],
      description: 'Readiness check including database connectivity',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                timestamp: { type: 'string' },
                uptime: { type: 'number' },
                database: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    latency: { type: 'number' },
                  },
                },
                redis: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    latency: { type: 'number' },
                  },
                },
              },
            },
            message: { type: 'string' },
            timestamp: { type: 'string' },
          },
        },
        503: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                timestamp: { type: 'string' },
                uptime: { type: 'number' },
                database: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                  },
                },
                redis: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                  },
                },
              },
            },
            message: { type: 'string' },
            timestamp: { type: 'string' },
          },
        },
      },
    },
  }, async (_request, reply) => {
    try {
      const { checkDatabaseHealth } = await import('../config/database');
      const { checkRedisHealth } = await import('../config/redis');
      
      const startTime = Date.now();
      const dbHealthy = await checkDatabaseHealth();
      const dbLatency = Date.now() - startTime;
      
      const redisStartTime = Date.now();
      const redisHealthy = await checkRedisHealth();
      const redisLatency = Date.now() - redisStartTime;
      
      const isReady = dbHealthy && redisHealthy;
      
      const readinessData = {
        status: isReady ? 'healthy' as const : 'unhealthy' as const,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
          status: dbHealthy ? 'connected' as const : 'error' as const,
          latency: dbLatency,
        },
        redis: {
          status: redisHealthy ? 'connected' as const : 'error' as const,
          latency: redisLatency,
        },
      };

      const statusCode = isReady ? StatusCodes.OK : StatusCodes.SERVICE_UNAVAILABLE;
      const message = isReady ? 'System is ready' : 'System is not ready';

      return successResponse(reply, readinessData, message, statusCode);
      
    } catch (error) {
      reply.log.error({ error }, 'Ready check failed');
      
      const readinessData = {
        status: 'unhealthy' as const,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
          status: 'error' as const,
        },
        redis: {
          status: 'error' as const,
        },
      };

      return reply.status(StatusCodes.SERVICE_UNAVAILABLE).send({
        success: false,
        data: readinessData,
        message: 'Ready check failed',
        timestamp: new Date().toISOString(),
      });
    }
  });
}