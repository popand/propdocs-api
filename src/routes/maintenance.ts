import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { maintenanceService } from '../services/MaintenanceService';
import { userService } from '../services/UserService';
import { ResponseBuilder } from '../utils/response';
import {
  MaintenanceFrequency,
  MaintenancePriority,
  TaskStatus,
} from '../generated/prisma';

function stripUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  );
}

const createScheduleSchema = z.object({
  assetId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  frequency: z.nativeEnum(MaintenanceFrequency),
  interval: z.number().int().min(1).optional(),
  startDate: z.string().datetime(),
  nextDue: z.string().datetime(),
  priority: z.nativeEnum(MaintenancePriority).optional(),
  estimatedCost: z.number().optional(),
  estimatedTime: z.number().int().optional(),
});

const updateScheduleSchema = createScheduleSchema
  .omit({ assetId: true })
  .partial()
  .extend({ isActive: z.boolean().optional() });

const createTaskSchema = z.object({
  scheduleId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  dueDate: z.string().datetime(),
  status: z.nativeEnum(TaskStatus).optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  completedAt: z.string().datetime().optional(),
  completedBy: z.string().optional(),
  notes: z.string().optional(),
  actualCost: z.number().optional(),
  actualTime: z.number().int().optional(),
});

const createServiceRecordSchema = z.object({
  assetId: z.string().min(1),
  taskId: z.string().optional(),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  serviceDate: z.string().datetime(),
  providerName: z.string().optional(),
  providerContact: z.string().optional(),
  cost: z.number().optional(),
  laborCost: z.number().optional(),
  partsCost: z.number().optional(),
  warrantyPeriod: z.number().int().optional(),
  notes: z.string().optional(),
});

async function resolveUserId(email: string): Promise<string> {
  let user = await userService.getByEmail(email);
  if (!user) {
    user = await userService.upsert({ email });
  }
  return user.id;
}

export async function maintenanceRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', requireAuth);

  // --- Schedules ---

  // GET /api/assets/:assetId/schedules
  fastify.get(
    '/api/assets/:assetId/schedules',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { assetId } = request.params as { assetId: string };
      const ownerId = await resolveUserId(request.userEmail);

      const schedules = await maintenanceService.listSchedulesByAsset(
        assetId,
        ownerId
      );
      if (!schedules) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Asset not found',
          code: 'ASSET_NOT_FOUND',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        });
      }

      return ResponseBuilder.success(reply, schedules);
    }
  );

  // POST /api/schedules
  fastify.post(
    '/api/schedules',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = createScheduleSchema.parse(request.body);
      const ownerId = await resolveUserId(request.userEmail);

      const schedule = await maintenanceService.createSchedule(
        ownerId,
        stripUndefined(body as unknown as Record<string, unknown>)
      );
      if (!schedule) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Asset not found or not owned by user',
          code: 'ASSET_NOT_FOUND',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        });
      }

      return ResponseBuilder.created(reply, schedule);
    }
  );

  // PUT /api/schedules/:id
  fastify.put(
    '/api/schedules/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const body = updateScheduleSchema.parse(request.body);
      const ownerId = await resolveUserId(request.userEmail);

      const schedule = await maintenanceService.updateSchedule(
        id,
        ownerId,
        stripUndefined(body as unknown as Record<string, unknown>)
      );
      if (!schedule) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Schedule not found',
          code: 'SCHEDULE_NOT_FOUND',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        });
      }

      return ResponseBuilder.success(reply, schedule);
    }
  );

  // DELETE /api/schedules/:id
  fastify.delete(
    '/api/schedules/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const ownerId = await resolveUserId(request.userEmail);

      const deleted = await maintenanceService.deleteSchedule(id, ownerId);
      if (!deleted) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Schedule not found',
          code: 'SCHEDULE_NOT_FOUND',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        });
      }

      return ResponseBuilder.deleted(reply);
    }
  );

  // --- Tasks ---

  // POST /api/tasks
  fastify.post(
    '/api/tasks',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = createTaskSchema.parse(request.body);
      const ownerId = await resolveUserId(request.userEmail);

      const task = await maintenanceService.createTask(
        ownerId,
        stripUndefined(body as unknown as Record<string, unknown>)
      );
      if (!task) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Schedule not found',
          code: 'SCHEDULE_NOT_FOUND',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        });
      }

      return ResponseBuilder.created(reply, task);
    }
  );

  // PUT /api/tasks/:id
  fastify.put(
    '/api/tasks/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const body = updateTaskSchema.parse(request.body);
      const ownerId = await resolveUserId(request.userEmail);

      const task = await maintenanceService.updateTask(
        id,
        ownerId,
        stripUndefined(body as unknown as Record<string, unknown>)
      );
      if (!task) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Task not found',
          code: 'TASK_NOT_FOUND',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        });
      }

      return ResponseBuilder.success(reply, task);
    }
  );

  // --- Service Records ---

  // GET /api/assets/:assetId/service-records
  fastify.get(
    '/api/assets/:assetId/service-records',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { assetId } = request.params as { assetId: string };
      const ownerId = await resolveUserId(request.userEmail);

      const records = await maintenanceService.listServiceRecordsByAsset(
        assetId,
        ownerId
      );
      if (!records) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Asset not found',
          code: 'ASSET_NOT_FOUND',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        });
      }

      return ResponseBuilder.success(reply, records);
    }
  );

  // POST /api/service-records
  fastify.post(
    '/api/service-records',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = createServiceRecordSchema.parse(request.body);
      const ownerId = await resolveUserId(request.userEmail);

      const record = await maintenanceService.createServiceRecord(
        ownerId,
        stripUndefined(body as unknown as Record<string, unknown>)
      );
      if (!record) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Asset not found or not owned by user',
          code: 'ASSET_NOT_FOUND',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        });
      }

      return ResponseBuilder.created(reply, record);
    }
  );
}
