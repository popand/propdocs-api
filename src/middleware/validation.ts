import { FastifyRequest, FastifyReply } from 'fastify';
import { z, ZodSchema } from 'zod';
import { ValidationError } from './errorHandler';

export interface ValidationSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
  headers?: ZodSchema;
}

export function validateRequest(schemas: ValidationSchemas) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Validate request body
      if (schemas.body) {
        request.body = await schemas.body.parseAsync(request.body);
      }

      // Validate request params
      if (schemas.params) {
        request.params = await schemas.params.parseAsync(request.params);
      }

      // Validate request query
      if (schemas.query) {
        request.query = await schemas.query.parseAsync(request.query);
      }

      // Validate request headers
      if (schemas.headers) {
        request.headers = await schemas.headers.parseAsync(request.headers);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(`Validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
      }
      throw error;
    }
  };
}

// Utility function to create typed request handler
export function createTypedHandler<
  TBody = unknown,
  TParams = unknown,
  TQuery = unknown,
  THeaders = unknown
>(
  schemas: {
    body?: ZodSchema<TBody>;
    params?: ZodSchema<TParams>;
    query?: ZodSchema<TQuery>;
    headers?: ZodSchema<THeaders>;
  },
  handler: (request: FastifyRequest & {
    body: TBody;
    params: TParams;
    query: TQuery;
    headers: THeaders;
  }, reply: FastifyReply) => Promise<unknown> | unknown
) {
  return {
    preHandler: validateRequest(schemas),
    handler: handler as any,
  };
}