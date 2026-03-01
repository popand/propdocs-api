import { FastifyRequest, FastifyReply } from 'fastify';
import { z, ZodSchema } from 'zod';
import { ValidationError } from './errorHandler';

export interface ValidationSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

export function validateRequest(schemas: ValidationSchemas) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    try {
      if (schemas.body) {
        request.body = await schemas.body.parseAsync(request.body);
      }
      if (schemas.params) {
        request.params = await schemas.params.parseAsync(request.params);
      }
      if (schemas.query) {
        request.query = await schemas.query.parseAsync(request.query);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(
          `Validation failed: ${error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(', ')}`
        );
      }
      throw error;
    }
  };
}
