import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { requireAuth } from '../middleware/auth';
import { storageService } from '../services/StorageService';
import { userService } from '../services/UserService';
import { prisma } from '../config/database';
import { ResponseBuilder } from '../utils/response';
import { DocumentType } from '../generated/prisma';

function getFieldValue(fields: Record<string, unknown>, name: string): string | undefined {
  const field = fields[name] as { value?: string } | undefined;
  return field?.value;
}

async function resolveUserId(email: string): Promise<string> {
  let user = await userService.getByEmail(email);
  if (!user) {
    user = await userService.upsert({ email });
  }
  return user.id;
}

export async function uploadRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', requireAuth);

  // POST /api/properties/:propertyId/photos
  fastify.post(
    '/api/properties/:propertyId/photos',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { propertyId } = request.params as { propertyId: string };
      const ownerId = await resolveUserId(request.userEmail);

      const property = await prisma.property.findFirst({
        where: { id: propertyId, ownerId, deletedAt: null },
      });
      if (!property) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Property not found',
          code: 'PROPERTY_NOT_FOUND',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        });
      }

      const file = await request.file();
      if (!file) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'No file uploaded',
          code: 'NO_FILE',
          statusCode: 400,
          timestamp: new Date().toISOString(),
        });
      }

      const buffer = await file.toBuffer();
      const { url } = await storageService.upload(
        buffer,
        file.filename,
        file.mimetype,
        `properties/${propertyId}`
      );

      const caption = getFieldValue(file.fields as Record<string, unknown>, 'caption');
      const data: Record<string, unknown> = { propertyId, url };
      if (caption) data['caption'] = caption;

      const photo = await prisma.propertyPhoto.create({
        data: data as Parameters<typeof prisma.propertyPhoto.create>[0]['data'],
      });

      return ResponseBuilder.created(reply, photo);
    }
  );

  // POST /api/assets/:assetId/photos
  fastify.post(
    '/api/assets/:assetId/photos',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { assetId } = request.params as { assetId: string };
      const ownerId = await resolveUserId(request.userEmail);

      const asset = await prisma.asset.findFirst({
        where: {
          id: assetId,
          deletedAt: null,
          property: { ownerId, deletedAt: null },
        },
      });
      if (!asset) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Asset not found',
          code: 'ASSET_NOT_FOUND',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        });
      }

      const file = await request.file();
      if (!file) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'No file uploaded',
          code: 'NO_FILE',
          statusCode: 400,
          timestamp: new Date().toISOString(),
        });
      }

      const buffer = await file.toBuffer();
      const { url } = await storageService.upload(
        buffer,
        file.filename,
        file.mimetype,
        `assets/${assetId}`
      );

      const caption = getFieldValue(file.fields as Record<string, unknown>, 'caption');
      const data: Record<string, unknown> = { assetId, url };
      if (caption) data['caption'] = caption;

      const photo = await prisma.assetPhoto.create({
        data: data as Parameters<typeof prisma.assetPhoto.create>[0]['data'],
      });

      return ResponseBuilder.created(reply, photo);
    }
  );

  // POST /api/assets/:assetId/documents
  fastify.post(
    '/api/assets/:assetId/documents',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { assetId } = request.params as { assetId: string };
      const ownerId = await resolveUserId(request.userEmail);

      const asset = await prisma.asset.findFirst({
        where: {
          id: assetId,
          deletedAt: null,
          property: { ownerId, deletedAt: null },
        },
      });
      if (!asset) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Asset not found',
          code: 'ASSET_NOT_FOUND',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        });
      }

      const file = await request.file();
      if (!file) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'No file uploaded',
          code: 'NO_FILE',
          statusCode: 400,
          timestamp: new Date().toISOString(),
        });
      }

      const buffer = await file.toBuffer();
      const { url } = await storageService.upload(
        buffer,
        file.filename,
        file.mimetype,
        `documents/${assetId}`
      );

      const fields = file.fields as Record<string, unknown>;
      const docType = (getFieldValue(fields, 'type') || 'OTHER') as DocumentType;
      const description = getFieldValue(fields, 'description');

      const data: Record<string, unknown> = {
        assetId,
        name: getFieldValue(fields, 'name') || file.filename,
        type: docType,
        url,
        size: buffer.length,
        mimeType: file.mimetype,
      };
      if (description) data['description'] = description;

      const doc = await prisma.assetDocument.create({
        data: data as Parameters<typeof prisma.assetDocument.create>[0]['data'],
      });

      return ResponseBuilder.created(reply, doc);
    }
  );
}
