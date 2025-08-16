import { z } from 'zod';
import { AssetCategory, AssetCondition, DocumentType } from '../generated/prisma';

// Asset validation rules
export const assetValidationRules = {
  name: z.string().min(1, 'Asset name is required').max(100, 'Asset name must be less than 100 characters'),
  category: z.nativeEnum(AssetCategory),
  type: z.string().min(1, 'Asset type is required').max(100, 'Asset type must be less than 100 characters'),
  brand: z.string().max(50, 'Brand must be less than 50 characters').optional(),
  model: z.string().max(100, 'Model must be less than 100 characters').optional(),
  serialNumber: z.string().max(100, 'Serial number must be less than 100 characters').optional(),
  purchaseDate: z.date().optional(),
  installationDate: z.date().optional(),
  warrantyExpiry: z.date().optional(),
  purchasePrice: z.number().min(0, 'Purchase price must be positive').max(1000000, 'Purchase price is too high').optional(),
  condition: z.nativeEnum(AssetCondition).default(AssetCondition.GOOD),
  conditionNotes: z.string().max(500, 'Condition notes must be less than 500 characters').optional(),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  room: z.string().max(100, 'Room must be less than 100 characters').optional(),
  specifications: z.record(z.any()).optional(),
};

// Asset creation schema
export const createAssetSchema = z.object({
  name: assetValidationRules.name,
  category: assetValidationRules.category,
  type: assetValidationRules.type,
  brand: assetValidationRules.brand,
  model: assetValidationRules.model,
  serialNumber: assetValidationRules.serialNumber,
  purchaseDate: assetValidationRules.purchaseDate,
  installationDate: assetValidationRules.installationDate,
  warrantyExpiry: assetValidationRules.warrantyExpiry,
  purchasePrice: assetValidationRules.purchasePrice,
  condition: assetValidationRules.condition,
  conditionNotes: assetValidationRules.conditionNotes,
  location: assetValidationRules.location,
  room: assetValidationRules.room,
  specifications: assetValidationRules.specifications,
});

// Asset update schema
export const updateAssetSchema = createAssetSchema.partial();

// Asset photo validation
export const assetPhotoSchema = z.object({
  url: z.string().url('Invalid URL format'),
  thumbnail: z.string().url('Invalid thumbnail URL format').optional(),
  caption: z.string().max(200, 'Caption must be less than 200 characters').optional(),
  order: z.number().int().min(0).default(0),
});

// Asset document validation
export const assetDocumentSchema = z.object({
  name: z.string().min(1, 'Document name is required').max(200, 'Document name must be less than 200 characters'),
  type: z.nativeEnum(DocumentType),
  url: z.string().url('Invalid URL format'),
  size: z.number().int().min(0).max(100 * 1024 * 1024).optional(), // Max 100MB
  mimeType: z.string().optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

// Asset search schema
export const assetSearchSchema = z.object({
  query: z.string().optional(),
  category: z.nativeEnum(AssetCategory).optional(),
  condition: z.nativeEnum(AssetCondition).optional(),
  brand: z.string().optional(),
  location: z.string().optional(),
  room: z.string().optional(),
  warrantyExpiringSoon: z.boolean().optional(), // Within next 30 days
  needsMaintenance: z.boolean().optional(),
});

// Condition update schema
export const updateAssetConditionSchema = z.object({
  condition: z.nativeEnum(AssetCondition),
  conditionNotes: z.string().max(500, 'Condition notes must be less than 500 characters').optional(),
  lastInspected: z.date().default(() => new Date()),
});

// Type exports
export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
export type AssetPhotoInput = z.infer<typeof assetPhotoSchema>;
export type AssetDocumentInput = z.infer<typeof assetDocumentSchema>;
export type AssetSearchInput = z.infer<typeof assetSearchSchema>;
export type UpdateAssetConditionInput = z.infer<typeof updateAssetConditionSchema>;

// Asset business rules
export const assetBusinessRules = {
  // Maximum photos per asset
  maxPhotos: 10,
  
  // Maximum documents per asset
  maxDocuments: 20,
  
  // Supported image formats
  supportedImageFormats: ['image/jpeg', 'image/png', 'image/webp'],
  
  // Supported document formats
  supportedDocumentFormats: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
  
  // Maximum file sizes (in bytes)
  maxPhotoSize: 10 * 1024 * 1024, // 10MB
  maxDocumentSize: 50 * 1024 * 1024, // 50MB
  
  // Condition aging rules (days since last inspection)
  conditionAging: {
    [AssetCondition.EXCELLENT]: 365, // Check yearly
    [AssetCondition.GOOD]: 180, // Check every 6 months
    [AssetCondition.FAIR]: 90, // Check every 3 months
    [AssetCondition.POOR]: 30, // Check monthly
    [AssetCondition.NEEDS_REPLACEMENT]: 7, // Check weekly
  },
  
  // Warranty reminder periods (days before expiry)
  warrantyReminderPeriods: [365, 180, 90, 30, 7], // 1 year, 6 months, 3 months, 1 month, 1 week
};

// Asset categorization by common types
export const assetTypesByCategory = {
  [AssetCategory.HVAC]: [
    'Central Air Conditioner',
    'Furnace',
    'Heat Pump',
    'Ductwork',
    'Thermostat',
    'Air Purifier',
    'Humidifier',
    'Dehumidifier',
  ],
  [AssetCategory.PLUMBING]: [
    'Water Heater',
    'Sump Pump',
    'Water Softener',
    'Garbage Disposal',
    'Toilets',
    'Faucets',
    'Shower Heads',
    'Pipes',
  ],
  [AssetCategory.ELECTRICAL]: [
    'Electrical Panel',
    'Generator',
    'Surge Protector',
    'Light Fixtures',
    'Ceiling Fans',
    'Outlets',
    'Switches',
    'Smoke Detectors',
  ],
  [AssetCategory.APPLIANCES]: [
    'Refrigerator',
    'Dishwasher',
    'Washing Machine',
    'Dryer',
    'Oven',
    'Microwave',
    'Range Hood',
    'Ice Maker',
  ],
  [AssetCategory.SECURITY]: [
    'Security System',
    'Doorbell Camera',
    'Motion Sensors',
    'Door Locks',
    'Window Sensors',
    'Surveillance Cameras',
    'Alarm Panel',
    'Keypad',
  ],
};

// Asset hierarchy for complex systems
export interface AssetHierarchy {
  parentId?: string;
  children?: string[];
  systemName?: string;
}