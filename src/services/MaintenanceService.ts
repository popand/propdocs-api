import { prisma } from '../config/database';
import {
  MaintenanceSchedule,
  MaintenanceTask,
  ServiceRecord,
} from '../generated/prisma';

export class MaintenanceService {
  // --- Schedules ---

  async createSchedule(
    ownerId: string,
    data: Record<string, unknown>
  ): Promise<MaintenanceSchedule | null> {
    const assetId = data['assetId'] as string;

    // Verify asset ownership
    const asset = await prisma.asset.findFirst({
      where: {
        id: assetId,
        deletedAt: null,
        property: { ownerId, deletedAt: null },
      },
    });
    if (!asset) return null;

    // Convert date strings
    const createData = { ...data };
    for (const key of ['startDate', 'nextDue']) {
      if (typeof createData[key] === 'string') {
        createData[key] = new Date(createData[key] as string);
      }
    }

    return prisma.maintenanceSchedule.create({
      data: createData as Parameters<
        typeof prisma.maintenanceSchedule.create
      >[0]['data'],
    });
  }

  async listSchedulesByAsset(
    assetId: string,
    ownerId: string
  ): Promise<MaintenanceSchedule[] | null> {
    const asset = await prisma.asset.findFirst({
      where: {
        id: assetId,
        deletedAt: null,
        property: { ownerId, deletedAt: null },
      },
    });
    if (!asset) return null;

    return prisma.maintenanceSchedule.findMany({
      where: { assetId },
      include: { maintenanceTasks: true },
      orderBy: { nextDue: 'asc' },
    });
  }

  async getScheduleById(
    id: string,
    ownerId: string
  ): Promise<MaintenanceSchedule | null> {
    return prisma.maintenanceSchedule.findFirst({
      where: {
        id,
        asset: {
          deletedAt: null,
          property: { ownerId, deletedAt: null },
        },
      },
      include: { maintenanceTasks: true },
    });
  }

  async updateSchedule(
    id: string,
    ownerId: string,
    data: Record<string, unknown>
  ): Promise<MaintenanceSchedule | null> {
    const existing = await this.getScheduleById(id, ownerId);
    if (!existing) return null;

    const updateData = { ...data };
    for (const key of ['startDate', 'nextDue']) {
      if (typeof updateData[key] === 'string') {
        updateData[key] = new Date(updateData[key] as string);
      }
    }

    return prisma.maintenanceSchedule.update({
      where: { id },
      data: updateData as Parameters<
        typeof prisma.maintenanceSchedule.update
      >[0]['data'],
    });
  }

  async deleteSchedule(id: string, ownerId: string): Promise<boolean> {
    const existing = await this.getScheduleById(id, ownerId);
    if (!existing) return false;

    await prisma.maintenanceSchedule.delete({ where: { id } });
    return true;
  }

  // --- Tasks ---

  async createTask(
    ownerId: string,
    data: Record<string, unknown>
  ): Promise<MaintenanceTask | null> {
    const scheduleId = data['scheduleId'] as string;

    const schedule = await this.getScheduleById(scheduleId, ownerId);
    if (!schedule) return null;

    const createData = { ...data };
    for (const key of ['dueDate', 'completedAt']) {
      if (typeof createData[key] === 'string') {
        createData[key] = new Date(createData[key] as string);
      }
    }

    return prisma.maintenanceTask.create({
      data: createData as Parameters<
        typeof prisma.maintenanceTask.create
      >[0]['data'],
    });
  }

  async updateTask(
    id: string,
    ownerId: string,
    data: Record<string, unknown>
  ): Promise<MaintenanceTask | null> {
    const task = await prisma.maintenanceTask.findFirst({
      where: {
        id,
        schedule: {
          asset: {
            deletedAt: null,
            property: { ownerId, deletedAt: null },
          },
        },
      },
    });
    if (!task) return null;

    const updateData = { ...data };
    for (const key of ['dueDate', 'completedAt']) {
      if (typeof updateData[key] === 'string') {
        updateData[key] = new Date(updateData[key] as string);
      }
    }

    return prisma.maintenanceTask.update({
      where: { id },
      data: updateData as Parameters<
        typeof prisma.maintenanceTask.update
      >[0]['data'],
    });
  }

  // --- Service Records ---

  async createServiceRecord(
    ownerId: string,
    data: Record<string, unknown>
  ): Promise<ServiceRecord | null> {
    const assetId = data['assetId'] as string;

    const asset = await prisma.asset.findFirst({
      where: {
        id: assetId,
        deletedAt: null,
        property: { ownerId, deletedAt: null },
      },
    });
    if (!asset) return null;

    const createData = { ...data };
    if (typeof createData['serviceDate'] === 'string') {
      createData['serviceDate'] = new Date(createData['serviceDate'] as string);
    }

    return prisma.serviceRecord.create({
      data: createData as Parameters<
        typeof prisma.serviceRecord.create
      >[0]['data'],
    });
  }

  async listServiceRecordsByAsset(
    assetId: string,
    ownerId: string
  ): Promise<ServiceRecord[] | null> {
    const asset = await prisma.asset.findFirst({
      where: {
        id: assetId,
        deletedAt: null,
        property: { ownerId, deletedAt: null },
      },
    });
    if (!asset) return null;

    return prisma.serviceRecord.findMany({
      where: { assetId },
      orderBy: { serviceDate: 'desc' },
    });
  }
}

export const maintenanceService = new MaintenanceService();
