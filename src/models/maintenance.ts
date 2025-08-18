import { z } from 'zod';
import { MaintenanceFrequency, MaintenancePriority, TaskStatus } from '../generated/prisma';

// Maintenance schedule validation rules
export const maintenanceScheduleValidationRules = {
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  frequency: z.nativeEnum(MaintenanceFrequency),
  interval: z.number().int().min(1, 'Interval must be at least 1').max(52, 'Interval cannot exceed 52').default(1),
  startDate: z.date(),
  priority: z.nativeEnum(MaintenancePriority).default(MaintenancePriority.MEDIUM),
  estimatedCost: z.number().min(0, 'Estimated cost must be positive').max(10000, 'Estimated cost is too high').optional(),
  estimatedTime: z.number().int().min(1, 'Estimated time must be at least 1 minute').max(1440, 'Estimated time cannot exceed 24 hours').optional(),
  isActive: z.boolean().default(true),
};

// Maintenance task validation rules
export const maintenanceTaskValidationRules = {
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  dueDate: z.date(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.PENDING),
  completedBy: z.string().max(100, 'Completed by must be less than 100 characters').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  actualCost: z.number().min(0, 'Actual cost must be positive').max(10000, 'Actual cost is too high').optional(),
  actualTime: z.number().int().min(1, 'Actual time must be at least 1 minute').max(1440, 'Actual time cannot exceed 24 hours').optional(),
};

// Service record validation rules
export const serviceRecordValidationRules = {
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
  serviceDate: z.date(),
  providerName: z.string().max(200, 'Provider name must be less than 200 characters').optional(),
  providerContact: z.string().max(200, 'Provider contact must be less than 200 characters').optional(),
  cost: z.number().min(0, 'Cost must be positive').max(50000, 'Cost is too high').optional(),
  laborCost: z.number().min(0, 'Labor cost must be positive').max(50000, 'Labor cost is too high').optional(),
  partsCost: z.number().min(0, 'Parts cost must be positive').max(50000, 'Parts cost is too high').optional(),
  warrantyPeriod: z.number().int().min(0, 'Warranty period must be positive').max(3650, 'Warranty period cannot exceed 10 years').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
};

// Schema definitions
export const createMaintenanceScheduleSchema = z.object({
  title: maintenanceScheduleValidationRules.title,
  description: maintenanceScheduleValidationRules.description,
  frequency: maintenanceScheduleValidationRules.frequency,
  interval: maintenanceScheduleValidationRules.interval,
  startDate: maintenanceScheduleValidationRules.startDate,
  priority: maintenanceScheduleValidationRules.priority,
  estimatedCost: maintenanceScheduleValidationRules.estimatedCost,
  estimatedTime: maintenanceScheduleValidationRules.estimatedTime,
  isActive: maintenanceScheduleValidationRules.isActive,
});

export const updateMaintenanceScheduleSchema = createMaintenanceScheduleSchema.partial();

export const createMaintenanceTaskSchema = z.object({
  title: maintenanceTaskValidationRules.title,
  description: maintenanceTaskValidationRules.description,
  dueDate: maintenanceTaskValidationRules.dueDate,
  status: maintenanceTaskValidationRules.status,
});

export const updateMaintenanceTaskSchema = z.object({
  title: maintenanceTaskValidationRules.title,
  description: maintenanceTaskValidationRules.description,
  status: maintenanceTaskValidationRules.status,
  completedBy: maintenanceTaskValidationRules.completedBy,
  notes: maintenanceTaskValidationRules.notes,
  actualCost: maintenanceTaskValidationRules.actualCost,
  actualTime: maintenanceTaskValidationRules.actualTime,
}).partial();

export const completeMaintenanceTaskSchema = z.object({
  completedBy: maintenanceTaskValidationRules.completedBy,
  notes: maintenanceTaskValidationRules.notes,
  actualCost: maintenanceTaskValidationRules.actualCost,
  actualTime: maintenanceTaskValidationRules.actualTime,
});

export const createServiceRecordSchema = z.object({
  title: serviceRecordValidationRules.title,
  description: serviceRecordValidationRules.description,
  serviceDate: serviceRecordValidationRules.serviceDate,
  providerName: serviceRecordValidationRules.providerName,
  providerContact: serviceRecordValidationRules.providerContact,
  cost: serviceRecordValidationRules.cost,
  laborCost: serviceRecordValidationRules.laborCost,
  partsCost: serviceRecordValidationRules.partsCost,
  warrantyPeriod: serviceRecordValidationRules.warrantyPeriod,
  notes: serviceRecordValidationRules.notes,
});

export const updateServiceRecordSchema = createServiceRecordSchema.partial();

// Maintenance search and filtering
export const maintenanceSearchSchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(MaintenancePriority).optional(),
  dueDateFrom: z.date().optional(),
  dueDateTo: z.date().optional(),
  overdue: z.boolean().optional(),
  upcoming: z.boolean().optional(), // Due within next 7 days
});

// Type exports
export type CreateMaintenanceScheduleInput = z.infer<typeof createMaintenanceScheduleSchema>;
export type UpdateMaintenanceScheduleInput = z.infer<typeof updateMaintenanceScheduleSchema>;
export type CreateMaintenanceTaskInput = z.infer<typeof createMaintenanceTaskSchema>;
export type UpdateMaintenanceTaskInput = z.infer<typeof updateMaintenanceTaskSchema>;
export type CompleteMaintenanceTaskInput = z.infer<typeof completeMaintenanceTaskSchema>;
export type CreateServiceRecordInput = z.infer<typeof createServiceRecordSchema>;
export type UpdateServiceRecordInput = z.infer<typeof updateServiceRecordSchema>;
export type MaintenanceSearchInput = z.infer<typeof maintenanceSearchSchema>;

// Maintenance business rules
export const maintenanceBusinessRules = {
  // Frequency to days mapping
  frequencyToDays: {
    [MaintenanceFrequency.WEEKLY]: 7,
    [MaintenanceFrequency.MONTHLY]: 30,
    [MaintenanceFrequency.QUARTERLY]: 90,
    [MaintenanceFrequency.SEMI_ANNUAL]: 182,
    [MaintenanceFrequency.ANNUAL]: 365,
    [MaintenanceFrequency.BI_ANNUAL]: 730,
    [MaintenanceFrequency.CUSTOM]: 0, // Will be calculated based on interval
  },
  
  // Overdue grace periods by priority
  overduePeriods: {
    [MaintenancePriority.CRITICAL]: 0, // Immediately overdue
    [MaintenancePriority.HIGH]: 1, // 1 day grace
    [MaintenancePriority.MEDIUM]: 3, // 3 days grace
    [MaintenancePriority.LOW]: 7, // 1 week grace
  },
  
  // Notification periods (days before due date)
  notificationPeriods: {
    [MaintenancePriority.CRITICAL]: [7, 3, 1, 0],
    [MaintenancePriority.HIGH]: [14, 7, 3, 1],
    [MaintenancePriority.MEDIUM]: [30, 14, 7],
    [MaintenancePriority.LOW]: [30, 14],
  },
  
  // Cost variance alerts (percentage over estimated cost)
  costVarianceThresholds: {
    [MaintenancePriority.CRITICAL]: 25, // 25% over estimate
    [MaintenancePriority.HIGH]: 50,
    [MaintenancePriority.MEDIUM]: 75,
    [MaintenancePriority.LOW]: 100,
  },
};

// Maintenance templates for common assets
export interface MaintenanceTemplate {
  title: string;
  description: string;
  frequency: MaintenanceFrequency;
  interval: number;
  priority: MaintenancePriority;
  estimatedCost?: number;
  estimatedTime?: number;
  category: string;
  assetTypes: string[];
}

export const maintenanceTemplates: MaintenanceTemplate[] = [
  // HVAC Templates
  {
    title: 'HVAC Filter Replacement',
    description: 'Replace air filters and inspect airflow',
    frequency: MaintenanceFrequency.QUARTERLY,
    interval: 1,
    priority: MaintenancePriority.HIGH,
    estimatedCost: 45,
    estimatedTime: 30,
    category: 'HVAC',
    assetTypes: ['Central Air Conditioner', 'Furnace', 'Heat Pump'],
  },
  {
    title: 'HVAC System Inspection',
    description: 'Professional inspection and tune-up of HVAC system',
    frequency: MaintenanceFrequency.ANNUAL,
    interval: 1,
    priority: MaintenancePriority.HIGH,
    estimatedCost: 200,
    estimatedTime: 120,
    category: 'HVAC',
    assetTypes: ['Central Air Conditioner', 'Furnace', 'Heat Pump'],
  },
  
  // Plumbing Templates
  {
    title: 'Water Heater Flush',
    description: 'Drain and flush water heater to remove sediment',
    frequency: MaintenanceFrequency.ANNUAL,
    interval: 1,
    priority: MaintenancePriority.MEDIUM,
    estimatedCost: 100,
    estimatedTime: 60,
    category: 'PLUMBING',
    assetTypes: ['Water Heater'],
  },
  
  // Appliance Templates
  {
    title: 'Refrigerator Coil Cleaning',
    description: 'Clean condenser coils and check door seals',
    frequency: MaintenanceFrequency.SEMI_ANNUAL,
    interval: 1,
    priority: MaintenancePriority.MEDIUM,
    estimatedCost: 0,
    estimatedTime: 45,
    category: 'APPLIANCES',
    assetTypes: ['Refrigerator'],
  },
];

// Service provider information
export interface ServiceProvider {
  name: string;
  contact: string;
  specialties: string[];
  rating?: number;
  notes?: string;
}