import { z } from 'zod';
import { SubscriptionTier } from '../generated/prisma';
import { uuidSchema } from './common';

// User validation schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  avatar: z.string().url('Invalid avatar URL').optional(),
  appleId: z.string().optional(),
  googleId: z.string().optional(),
  subscriptionTier: z.nativeEnum(SubscriptionTier).default(SubscriptionTier.FREE),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
  subscriptionTier: z.nativeEnum(SubscriptionTier).optional(),
});

export const userPreferencesSchema = z.object({
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  maintenanceReminders: z.boolean().default(true),
  reportSharing: z.boolean().default(false),
  timezone: z.string().default('UTC'),
  dateFormat: z.string().default('MM/DD/YYYY'),
  temperatureUnit: z.enum(['F', 'C']).default('F'),
});

// User response schemas
export const userResponseSchema = z.object({
  id: uuidSchema,
  email: z.string().email(),
  name: z.string().nullable(),
  avatar: z.string().nullable(),
  subscriptionTier: z.nativeEnum(SubscriptionTier),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const userWithPreferencesResponseSchema = userResponseSchema.extend({
  preferences: userPreferencesSchema.nullable(),
});

// Parameter schemas
export const userParamsSchema = z.object({
  userId: uuidSchema,
});

// Type exports
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type UserWithPreferencesResponse = z.infer<typeof userWithPreferencesResponseSchema>;
export type UserParams = z.infer<typeof userParamsSchema>;