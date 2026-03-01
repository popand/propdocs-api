import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { userService } from '../services/UserService';
import { ResponseBuilder } from '../utils/response';

const syncBodySchema = z.object({
  name: z.string().optional(),
  avatar: z.string().url().optional(),
  appleId: z.string().optional(),
  googleId: z.string().optional(),
});

const updateMeBodySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional(),
});

const updatePreferencesBodySchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  maintenanceReminders: z.boolean().optional(),
  reportSharing: z.boolean().optional(),
  timezone: z.string().optional(),
  dateFormat: z.string().optional(),
  temperatureUnit: z.enum(['F', 'C']).optional(),
});

export async function authRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', requireAuth);

  // POST /api/auth/sync — upsert user after Supabase login
  fastify.post(
    '/api/auth/sync',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = syncBodySchema.parse(request.body);
      const upsertData: Record<string, string> = { email: request.userEmail };
      if (body.name) upsertData['name'] = body.name;
      if (body.avatar) upsertData['avatar'] = body.avatar;
      if (body.appleId) upsertData['appleId'] = body.appleId;
      if (body.googleId) upsertData['googleId'] = body.googleId;

      const user = await userService.upsert(upsertData as { email: string; name?: string; avatar?: string; appleId?: string; googleId?: string });
      return ResponseBuilder.success(reply, user);
    }
  );

  // GET /api/auth/me — get current user profile with preferences
  fastify.get(
    '/api/auth/me',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = await userService.getByEmailWithPreferences(
        request.userEmail
      );

      if (!user) {
        const newUser = await userService.upsert({
          email: request.userEmail,
        });
        return ResponseBuilder.success(reply, newUser);
      }

      return ResponseBuilder.success(reply, user);
    }
  );

  // PUT /api/auth/me — update current user profile
  fastify.put(
    '/api/auth/me',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = updateMeBodySchema.parse(request.body);

      let user = await userService.getByEmail(request.userEmail);
      if (!user) {
        user = await userService.upsert({ email: request.userEmail });
      }

      const updateData: Record<string, string> = {};
      if (body.name) updateData['name'] = body.name;
      if (body.avatar) updateData['avatar'] = body.avatar;

      const updated = await userService.update(user.id, updateData as { name?: string; avatar?: string });
      return ResponseBuilder.success(reply, updated);
    }
  );

  // PUT /api/auth/me/preferences — update user preferences
  fastify.put(
    '/api/auth/me/preferences',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = updatePreferencesBodySchema.parse(request.body);

      let user = await userService.getByEmail(request.userEmail);
      if (!user) {
        user = await userService.upsert({ email: request.userEmail });
      }

      // Build a clean object with only defined keys
      const prefsData: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(body)) {
        if (value !== undefined) {
          prefsData[key] = value;
        }
      }

      const preferences = await userService.updatePreferences(
        user.id,
        prefsData
      );
      return ResponseBuilder.success(reply, preferences);
    }
  );

  // DELETE /api/auth/account — soft delete account
  fastify.delete(
    '/api/auth/account',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = await userService.getByEmail(request.userEmail);

      if (!user) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'User not found',
          code: 'USER_NOT_FOUND',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        });
      }

      await userService.softDelete(user.id);
      return ResponseBuilder.deleted(reply, 'Account deleted successfully');
    }
  );
}
