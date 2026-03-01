import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { propertyService } from '../services/PropertyService';
import { userService } from '../services/UserService';
import { ResponseBuilder } from '../utils/response';
import { PropertyType } from '../generated/prisma';

const createPropertySchema = z.object({
  name: z.string().min(1).max(200),
  type: z.nativeEnum(PropertyType),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  yearBuilt: z.number().int().optional(),
  squareFeet: z.number().int().optional(),
  bedrooms: z.number().int().optional(),
  bathrooms: z.number().optional(),
  description: z.string().optional(),
});

const updatePropertySchema = createPropertySchema.partial();

function stripUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  );
}

async function resolveUserId(email: string): Promise<string> {
  let user = await userService.getByEmail(email);
  if (!user) {
    user = await userService.upsert({ email });
  }
  return user.id;
}

export async function propertyRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', requireAuth);

  // GET /api/properties
  fastify.get(
    '/api/properties',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const q = request.query as Record<string, string>;
      const page = Math.max(1, parseInt(q['page'] || '1', 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(q['limit'] || '20', 10) || 20));
      const ownerId = await resolveUserId(request.userEmail);

      const result = await propertyService.listByOwner(ownerId, page, limit);

      return ResponseBuilder.paginated(reply, {
        items: result.items,
        total: result.total,
        page,
        limit,
      });
    }
  );

  // GET /api/properties/:id
  fastify.get(
    '/api/properties/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const ownerId = await resolveUserId(request.userEmail);

      const property = await propertyService.getById(id, ownerId);
      if (!property) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Property not found',
          code: 'PROPERTY_NOT_FOUND',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        });
      }

      return ResponseBuilder.success(reply, property);
    }
  );

  // POST /api/properties
  fastify.post(
    '/api/properties',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = createPropertySchema.parse(request.body);
      const ownerId = await resolveUserId(request.userEmail);

      const property = await propertyService.create(
        ownerId,
        stripUndefined(body as unknown as Record<string, unknown>)
      );
      return ResponseBuilder.created(reply, property);
    }
  );

  // PUT /api/properties/:id
  fastify.put(
    '/api/properties/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const body = updatePropertySchema.parse(request.body);
      const ownerId = await resolveUserId(request.userEmail);

      const property = await propertyService.update(
        id,
        ownerId,
        stripUndefined(body as unknown as Record<string, unknown>)
      );
      if (!property) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Property not found',
          code: 'PROPERTY_NOT_FOUND',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        });
      }

      return ResponseBuilder.success(reply, property);
    }
  );

  // DELETE /api/properties/:id
  fastify.delete(
    '/api/properties/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const ownerId = await resolveUserId(request.userEmail);

      const deleted = await propertyService.softDelete(id, ownerId);
      if (!deleted) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Property not found',
          code: 'PROPERTY_NOT_FOUND',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        });
      }

      return ResponseBuilder.deleted(reply);
    }
  );
}
