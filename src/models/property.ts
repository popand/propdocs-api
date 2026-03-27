import { z } from 'zod';
import { PropertyType } from '../generated/prisma';

// Property validation rules
export const propertyValidationRules = {
  name: z.string().min(1, 'Property name is required').max(100, 'Property name must be less than 100 characters'),
  type: z.nativeEnum(PropertyType),
  address: z.string().min(1, 'Address is required').max(200, 'Address must be less than 200 characters'),
  city: z.string().min(1, 'City is required').max(100, 'City must be less than 100 characters'),
  state: z.string().min(2, 'State must be at least 2 characters').max(50, 'State must be less than 50 characters'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
  country: z.string().length(2, 'Country must be 2-character code').default('US'),
  
  // Geographic coordinates
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  
  // Property details
  yearBuilt: z.number().int().min(1800).max(new Date().getFullYear() + 2).optional(),
  squareFeet: z.number().int().min(1).max(50000).optional(),
  bedrooms: z.number().int().min(0).max(20).optional(),
  bathrooms: z.number().min(0).max(20).optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
};

// Property creation schema
export const createPropertySchema = z.object({
  name: propertyValidationRules.name,
  type: propertyValidationRules.type,
  address: propertyValidationRules.address,
  city: propertyValidationRules.city,
  state: propertyValidationRules.state,
  zipCode: propertyValidationRules.zipCode,
  country: propertyValidationRules.country,
  latitude: propertyValidationRules.latitude,
  longitude: propertyValidationRules.longitude,
  yearBuilt: propertyValidationRules.yearBuilt,
  squareFeet: propertyValidationRules.squareFeet,
  bedrooms: propertyValidationRules.bedrooms,
  bathrooms: propertyValidationRules.bathrooms,
  description: propertyValidationRules.description,
});

// Property update schema
export const updatePropertySchema = createPropertySchema.partial();

// Property photo validation
export const propertyPhotoSchema = z.object({
  url: z.string().url('Invalid URL format'),
  thumbnail: z.string().url('Invalid thumbnail URL format').optional(),
  caption: z.string().max(200, 'Caption must be less than 200 characters').optional(),
  order: z.number().int().min(0).default(0),
});

// Property search schema
export const propertySearchSchema = z.object({
  query: z.string().optional(),
  type: z.nativeEnum(PropertyType).optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  yearBuiltMin: z.number().int().min(1800).optional(),
  yearBuiltMax: z.number().int().max(new Date().getFullYear() + 2).optional(),
  squareFeetMin: z.number().int().min(1).optional(),
  squareFeetMax: z.number().int().max(50000).optional(),
  bedroomsMin: z.number().int().min(0).optional(),
  bedroomsMax: z.number().int().min(0).optional(),
  bathroomsMin: z.number().min(0).optional(),
  bathroomsMax: z.number().min(0).optional(),
});

// Type exports
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type PropertyPhotoInput = z.infer<typeof propertyPhotoSchema>;
export type PropertySearchInput = z.infer<typeof propertySearchSchema>;

// Property business rules
export const propertyBusinessRules = {
  // Maximum photos per property
  maxPhotos: 20,
  
  // Supported image formats
  supportedImageFormats: ['image/jpeg', 'image/png', 'image/webp'],
  
  // Maximum file size for photos (in bytes)
  maxPhotoSize: 10 * 1024 * 1024, // 10MB
  
  // Thumbnail dimensions
  thumbnailDimensions: {
    width: 300,
    height: 200,
  },
  
  // Full image dimensions
  maxImageDimensions: {
    width: 2048,
    height: 1536,
  },
};

// Property sharing permissions
export enum PropertySharingLevel {
  PRIVATE = 'PRIVATE',
  SHARED_LINK = 'SHARED_LINK',
  PUBLIC_LISTING = 'PUBLIC_LISTING',
}

// Property share link configuration
export const propertyShareSchema = z.object({
  level: z.nativeEnum(PropertySharingLevel),
  expiresAt: z.date().optional(),
  allowDownload: z.boolean().default(false),
  passwordProtected: z.boolean().default(false),
  password: z.string().min(6).optional(),
});