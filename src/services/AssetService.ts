import { prisma } from '../config/database';
import { Asset } from '../generated/prisma';

export class AssetService {
  async create(ownerId: string, data: Record<string, unknown>): Promise<Asset | null> {
    const propertyId = data['propertyId'] as string;
    // Verify property belongs to the user
    const property = await prisma.property.findFirst({
      where: { id: propertyId, ownerId, deletedAt: null },
    });
    if (!property) return null;

    // Convert date strings to Date objects
    const createData = { ...data };
    for (const key of ['purchaseDate', 'installationDate', 'warrantyExpiry']) {
      if (typeof createData[key] === 'string') {
        createData[key] = new Date(createData[key] as string);
      }
    }

    return prisma.asset.create({
      data: createData as Parameters<typeof prisma.asset.create>[0]['data'],
    });
  }

  async listByProperty(
    propertyId: string,
    ownerId: string,
    page: number,
    limit: number
  ): Promise<{ items: Asset[]; total: number } | null> {
    const property = await prisma.property.findFirst({
      where: { id: propertyId, ownerId, deletedAt: null },
    });
    if (!property) return null;

    const where = { propertyId, deletedAt: null };
    const [items, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.asset.count({ where }),
    ]);
    return { items, total };
  }

  async getById(id: string, ownerId: string): Promise<Asset | null> {
    return prisma.asset.findFirst({
      where: {
        id,
        deletedAt: null,
        property: { ownerId, deletedAt: null },
      },
      include: { photos: true, documents: true },
    });
  }

  async update(
    id: string,
    ownerId: string,
    data: Record<string, unknown>
  ): Promise<Asset | null> {
    const existing = await prisma.asset.findFirst({
      where: {
        id,
        deletedAt: null,
        property: { ownerId, deletedAt: null },
      },
    });
    if (!existing) return null;

    // Convert date strings to Date objects
    const updateData = { ...data };
    for (const key of ['purchaseDate', 'installationDate', 'warrantyExpiry']) {
      if (typeof updateData[key] === 'string') {
        updateData[key] = new Date(updateData[key] as string);
      }
    }

    return prisma.asset.update({
      where: { id },
      data: updateData as Parameters<typeof prisma.asset.update>[0]['data'],
    });
  }

  async softDelete(id: string, ownerId: string): Promise<boolean> {
    const existing = await prisma.asset.findFirst({
      where: {
        id,
        deletedAt: null,
        property: { ownerId, deletedAt: null },
      },
    });
    if (!existing) return false;

    await prisma.asset.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return true;
  }
}

export const assetService = new AssetService();
