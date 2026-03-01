import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { assetService } from '../services/AssetService';
import { userService } from '../services/UserService';
import { ResponseBuilder } from '../utils/response';
import { AssetCategory, AssetCondition } from '../generated/prisma';

const createAssetSchema = z.object({
  propertyId: z.string().min(1),
  name: z.string().min(1).max(200),
  category: z.nativeEnum(AssetCategory),
  type: z.string().min(1),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().datetime().optional(),
  installationDate: z.string().datetime().optional(),
  warrantyExpiry: z.string().datetime().optional(),
  purchasePrice: z.number().optional(),
  condition: z.nativeEnum(AssetCondition).optional(),
  conditionNotes: z.string().optional(),
  location: z.string().optional(),
  room: z.string().optional(),
  specifications: z.record(z.string(), z.unknown()).optional(),
});

const updateAssetSchema = createAssetSchema.omit({ propertyId: true }).partial();

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

export async function assetRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', requireAuth);

  // GET /api/properties/:propertyId/assets
  fastify.get(
    '/api/properties/:propertyId/assets',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { propertyId } = request.params as { propertyId: string };
      const q = request.query as Record<string, string>;
      const page = Math.max(1, parseInt(q['page'] || '1', 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(q['limit'] || '20', 10) || 20));
      const ownerId = await resolveUserId(request.userEmail);

      const result = await assetService.listByProperty(
        propertyId,
        ownerId,
        page,
        limit
      );

      if (!result) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Property not found',
          code: 'PROPERTY_NOT_FOUND',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        });
      }

      return ResponseBuilder.paginated(reply, {
        items: result.items,
        total: result.total,
        page,
        limit,
      });
    }
  );

  // GET /api/assets/:id
  fastify.get(
    '/api/assets/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const ownerId = await resolveUserId(request.userEmail);

      const asset = await assetService.getById(id, ownerId);
      if (!asset) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Asset not found',
          code: 'ASSET_NOT_FOUND',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        });
      }

      return ResponseBuilder.success(reply, asset);
    }
  );

  // POST /api/assets
  fastify.post(
    '/api/assets',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = createAssetSchema.parse(request.body);
      const ownerId = await resolveUserId(request.userEmail);

      const asset = await assetService.create(
        ownerId,
        stripUndefined(body as unknown as Record<string, unknown>)
      );
      if (!asset) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Property not found or not owned by user',
          code: 'PROPERTY_NOT_FOUND',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        });
      }

      return ResponseBuilder.created(reply, asset);
    }
  );

  // PUT /api/assets/:id
  fastify.put(
    '/api/assets/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const body = updateAssetSchema.parse(request.body);
      const ownerId = await resolveUserId(request.userEmail);

      const asset = await assetService.update(
        id,
        ownerId,
        stripUndefined(body as unknown as Record<string, unknown>)
      );
      if (!asset) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Asset not found',
          code: 'ASSET_NOT_FOUND',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        });
      }

      return ResponseBuilder.success(reply, asset);
    }
  );

  // DELETE /api/assets/:id
  fastify.delete(
    '/api/assets/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const ownerId = await resolveUserId(request.userEmail);

      const deleted = await assetService.softDelete(id, ownerId);
      if (!deleted) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Asset not found',
          code: 'ASSET_NOT_FOUND',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        });
      }

      return ResponseBuilder.deleted(reply);
    }
  );
}
