import { FastifyInstance } from 'fastify';
import { fastifySwagger } from '@fastify/swagger';
import { fastifySwaggerUi } from '@fastify/swagger-ui';

export async function setupSwagger(fastify: FastifyInstance) {
  // Register Swagger
  await fastify.register(fastifySwagger, {
    swagger: {
      info: {
        title: 'PropDocs API',
        description: 'Property Asset Management Backend API',
        version: '1.0.0',
        contact: {
          name: 'PropDocs Support',
          email: 'support@propdocs.dev',
        },
      },
      host: process.env.API_HOST || 'localhost:3000',
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [
        { name: 'Health', description: 'Health check endpoints' },
        { name: 'Auth', description: 'Authentication endpoints' },
        { name: 'Users', description: 'User management endpoints' },
        { name: 'Properties', description: 'Property management endpoints' },
        { name: 'Assets', description: 'Asset management endpoints' },
        { name: 'Maintenance', description: 'Maintenance management endpoints' },
      ],
      securityDefinitions: {
        bearerAuth: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
          description: 'Enter JWT token in the format: Bearer <token>',
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
  });

  // Register Swagger UI
  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
    },
    uiHooks: {
      onRequest: function (_request, _reply, next) {
        next();
      },
      preHandler: function (_request, _reply, next) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject) => {
      return swaggerObject;
    },
    transformSpecificationClone: true,
  });
}