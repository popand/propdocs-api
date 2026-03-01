import { prisma } from '../config/database';
import { User, UserPreferences } from '../generated/prisma';

// Strip keys with undefined values so Prisma doesn't see them
function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as T;
}

export class UserService {
  async upsert(data: {
    email: string;
    name?: string;
    avatar?: string;
    appleId?: string;
    googleId?: string;
  }): Promise<User> {
    const { email, ...rest } = data;
    const optional = stripUndefined(rest);

    return prisma.user.upsert({
      where: { email },
      create: { email, ...optional },
      update: optional,
    });
  }

  async getById(id: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async getByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
  }

  async getByEmailWithPreferences(
    email: string
  ): Promise<(User & { preferences: UserPreferences | null }) | null> {
    return prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: { preferences: true },
    });
  }

  async update(
    id: string,
    data: { name?: string; avatar?: string }
  ): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: stripUndefined(data),
    });
  }

  async updatePreferences(
    userId: string,
    data: Record<string, unknown>
  ): Promise<UserPreferences> {
    const cleaned = stripUndefined(data);
    return prisma.userPreferences.upsert({
      where: { userId },
      create: { userId, ...cleaned },
      update: cleaned,
    });
  }

  async softDelete(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

export const userService = new UserService();
