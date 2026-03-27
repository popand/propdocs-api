import { z } from 'zod';
import { SubscriptionTier } from '../generated/prisma';

// User validation rules and business logic
export const userValidationRules = {
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
  subscriptionTier: z.nativeEnum(SubscriptionTier),
  
  // Authentication provider validation
  appleId: z.string().min(1, 'Apple ID is required').optional(),
  googleId: z.string().min(1, 'Google ID is required').optional(),
};

// User business rules
export const userBusinessRules = {
  // Maximum properties per subscription tier
  maxProperties: {
    [SubscriptionTier.FREE]: 1,
    [SubscriptionTier.PREMIUM]: 5,
    [SubscriptionTier.PROFESSIONAL]: Number.MAX_SAFE_INTEGER,
  },
  
  // Maximum assets per property by subscription tier
  maxAssetsPerProperty: {
    [SubscriptionTier.FREE]: 10,
    [SubscriptionTier.PREMIUM]: 100,
    [SubscriptionTier.PROFESSIONAL]: Number.MAX_SAFE_INTEGER,
  },
  
  // Storage limits (in MB)
  storageLimit: {
    [SubscriptionTier.FREE]: 100, // 100MB
    [SubscriptionTier.PREMIUM]: 1000, // 1GB
    [SubscriptionTier.PROFESSIONAL]: 10000, // 10GB
  },
};

// User creation schema
export const createUserSchema = z.object({
  email: userValidationRules.email,
  name: userValidationRules.name,
  subscriptionTier: userValidationRules.subscriptionTier.default(SubscriptionTier.FREE),
  appleId: userValidationRules.appleId,
  googleId: userValidationRules.googleId,
});

// User update schema
export const updateUserSchema = z.object({
  name: userValidationRules.name,
  subscriptionTier: userValidationRules.subscriptionTier,
}).partial();

// User preferences validation
export const userPreferencesSchema = z.object({
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  maintenanceReminders: z.boolean().default(true),
  reportSharing: z.boolean().default(false),
  timezone: z.string().default('UTC'),
  dateFormat: z.string().default('MM/DD/YYYY'),
  temperatureUnit: z.enum(['F', 'C']).default('F'),
});

// Type exports
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;

// User role definitions (for future authorization)
export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  VIEWER = 'VIEWER',
  MAINTAINER = 'MAINTAINER',
}

// User permissions for property access
export enum PropertyPermission {
  READ = 'READ',
  WRITE = 'WRITE',
  ADMIN = 'ADMIN',
  SHARE = 'SHARE',
}