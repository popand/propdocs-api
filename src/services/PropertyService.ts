import { prisma } from '../config/database';
import { Property } from '../generated/prisma';

export class PropertyService {
  async create(ownerId: string, data: Record<string, unknown>): Promise<Property> {
    return prisma.property.create({
      data: {
        ...data,
        ownerId,
      } as Parameters<typeof prisma.property.create>[0]['data'],
    });
  }

  async listByOwner(
    ownerId: string,
    page: number,
    limit: number
  ): Promise<{ items: Property[]; total: number }> {
    const where = { ownerId, deletedAt: null };
    const [items, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.property.count({ where }),
    ]);
    return { items, total };
  }

  async getById(id: string, ownerId: string): Promise<Property | null> {
    return prisma.property.findFirst({
      where: { id, ownerId, deletedAt: null },
      include: { photos: true },
    });
  }

  async update(
    id: string,
    ownerId: string,
    data: Record<string, unknown>
  ): Promise<Property | null> {
    const existing = await prisma.property.findFirst({
      where: { id, ownerId, deletedAt: null },
    });
    if (!existing) return null;

    return prisma.property.update({
      where: { id },
      data: data as Parameters<typeof prisma.property.update>[0]['data'],
    });
  }

  async softDelete(id: string, ownerId: string): Promise<boolean> {
    const existing = await prisma.property.findFirst({
      where: { id, ownerId, deletedAt: null },
    });
    if (!existing) return false;

    await prisma.property.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return true;
  }
}

export const propertyService = new PropertyService();
