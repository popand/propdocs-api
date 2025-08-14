import { PrismaClient, SubscriptionTier, PropertyType, AssetCategory, AssetCondition, MaintenanceFrequency, MaintenancePriority, TaskStatus } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Starting database seeding...');

  // Create test users
  const testUser1 = await prisma.user.upsert({
    where: { email: 'john.doe@propdocs.dev' },
    update: {},
    create: {
      email: 'john.doe@propdocs.dev',
      name: 'John Doe',
      subscriptionTier: SubscriptionTier.PREMIUM,
    },
  });

  const testUser2 = await prisma.user.upsert({
    where: { email: 'jane.smith@propdocs.dev' },
    update: {},
    create: {
      email: 'jane.smith@propdocs.dev',
      name: 'Jane Smith',
      subscriptionTier: SubscriptionTier.FREE,
      appleId: 'apple_test_123',
    },
  });

  console.log('✅ Created test users');

  // Create user preferences
  await prisma.userPreferences.upsert({
    where: { userId: testUser1.id },
    update: {},
    create: {
      userId: testUser1.id,
      emailNotifications: true,
      pushNotifications: true,
      maintenanceReminders: true,
      timezone: 'America/New_York',
      temperatureUnit: 'F',
    },
  });

  // Create test properties
  const property1 = await prisma.property.create({
    data: {
      name: 'Main Family Home',
      type: PropertyType.HOUSE,
      address: '123 Maple Street',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      yearBuilt: 2015,
      squareFeet: 2400,
      bedrooms: 4,
      bathrooms: 2.5,
      description: 'Beautiful family home with modern amenities',
      ownerId: testUser1.id,
    },
  });

  const property2 = await prisma.property.create({
    data: {
      name: 'Downtown Condo',
      type: PropertyType.CONDO,
      address: '456 Oak Avenue, Unit 5B',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      yearBuilt: 2020,
      squareFeet: 1200,
      bedrooms: 2,
      bathrooms: 2,
      description: 'Modern downtown condominium',
      ownerId: testUser2.id,
    },
  });

  console.log('✅ Created test properties');

  // Create test assets for property 1
  const hvacAsset = await prisma.asset.create({
    data: {
      propertyId: property1.id,
      name: 'Central Air Conditioning',
      category: AssetCategory.HVAC,
      type: 'Central AC Unit',
      brand: 'Carrier',
      model: 'Infinity 21 Central Air Conditioner',
      serialNumber: 'CAR2024-AC-001',
      purchaseDate: new Date('2015-05-15'),
      installationDate: new Date('2015-06-01'),
      warrantyExpiry: new Date('2025-06-01'),
      purchasePrice: 4500.00,
      condition: AssetCondition.GOOD,
      location: 'Backyard',
      room: 'Exterior',
      specifications: {
        tonnage: '3.5 ton',
        seer: 21,
        refrigerant: 'R-410A',
        voltage: '240V',
      },
    },
  });

  const applianceAsset = await prisma.asset.create({
    data: {
      propertyId: property1.id,
      name: 'Kitchen Refrigerator',
      category: AssetCategory.APPLIANCES,
      type: 'Side-by-Side Refrigerator',
      brand: 'LG',
      model: 'LRSDS2706S',
      serialNumber: 'LG2024-REF-456',
      purchaseDate: new Date('2016-03-20'),
      installationDate: new Date('2016-03-22'),
      warrantyExpiry: new Date('2019-03-22'),
      purchasePrice: 1899.99,
      condition: AssetCondition.EXCELLENT,
      location: 'Kitchen',
      room: 'Kitchen',
      specifications: {
        capacity: '27 cu ft',
        energyStar: true,
        features: ['Ice & Water Dispenser', 'Smart Diagnosis', 'LED Lighting'],
      },
    },
  });

  // Create assets for property 2
  await prisma.asset.create({
    data: {
      propertyId: property2.id,
      name: 'Washer/Dryer Combo',
      category: AssetCategory.APPLIANCES,
      type: 'Combo Washer Dryer',
      brand: 'Whirlpool',
      model: 'WFC8090GX',
      serialNumber: 'WP2024-WD-789',
      purchaseDate: new Date('2020-08-10'),
      installationDate: new Date('2020-08-15'),
      warrantyExpiry: new Date('2022-08-15'),
      purchasePrice: 1299.00,
      condition: AssetCondition.GOOD,
      location: 'Utility Closet',
      room: 'Laundry',
    },
  });

  console.log('✅ Created test assets');

  // Create maintenance schedules
  const hvacMaintenanceSchedule = await prisma.maintenanceSchedule.create({
    data: {
      assetId: hvacAsset.id,
      title: 'HVAC Filter Replacement',
      description: 'Replace air filters and inspect system',
      frequency: MaintenanceFrequency.QUARTERLY,
      interval: 1,
      startDate: new Date('2024-01-01'),
      nextDue: new Date('2024-04-01'),
      priority: MaintenancePriority.HIGH,
      estimatedCost: 45.00,
      estimatedTime: 30, // 30 minutes
    },
  });

  await prisma.maintenanceSchedule.create({
    data: {
      assetId: applianceAsset.id,
      title: 'Refrigerator Coil Cleaning',
      description: 'Clean condenser coils and check seals',
      frequency: MaintenanceFrequency.SEMI_ANNUAL,
      interval: 1,
      startDate: new Date('2024-01-01'),
      nextDue: new Date('2024-07-01'),
      priority: MaintenancePriority.MEDIUM,
      estimatedCost: 0.00, // DIY task
      estimatedTime: 45,
    },
  });

  console.log('✅ Created maintenance schedules');

  // Create some maintenance tasks
  await prisma.maintenanceTask.create({
    data: {
      scheduleId: hvacMaintenanceSchedule.id,
      title: 'Q1 2024 HVAC Filter Replacement',
      description: 'Replace all air filters in the system',
      dueDate: new Date('2024-04-01'),
      status: TaskStatus.COMPLETED,
      completedAt: new Date('2024-03-28'),
      completedBy: 'John Doe',
      notes: 'Replaced all 3 filters. System running efficiently.',
      actualCost: 42.50,
      actualTime: 25,
    },
  });

  await prisma.maintenanceTask.create({
    data: {
      scheduleId: hvacMaintenanceSchedule.id,
      title: 'Q2 2024 HVAC Filter Replacement',
      description: 'Replace all air filters in the system',
      dueDate: new Date('2024-07-01'),
      status: TaskStatus.PENDING,
    },
  });

  console.log('✅ Created maintenance tasks');

  // Create some service records
  await prisma.serviceRecord.create({
    data: {
      assetId: hvacAsset.id,
      title: 'Annual HVAC Inspection',
      description: 'Professional inspection and tune-up of central AC system',
      serviceDate: new Date('2024-03-15'),
      providerName: 'Cool Air HVAC Services',
      providerContact: '(555) 123-4567',
      cost: 180.00,
      laborCost: 120.00,
      partsCost: 60.00,
      warrantyPeriod: 90, // 90 days
      notes: 'System in excellent condition. Refrigerant levels good. Minor coil cleaning performed.',
    },
  });

  await prisma.serviceRecord.create({
    data: {
      assetId: applianceAsset.id,
      title: 'Refrigerator Water Filter Replacement',
      description: 'Replaced water filter cartridge',
      serviceDate: new Date('2024-02-10'),
      cost: 35.99,
      partsCost: 35.99,
      notes: 'Water filter replaced. Improved water taste and flow.',
    },
  });

  console.log('✅ Created service records');

  // Create some activity logs
  await prisma.userActivityLog.create({
    data: {
      userId: testUser1.id,
      action: 'CREATE_PROPERTY',
      resource: 'properties',
      metadata: {
        propertyId: property1.id,
        propertyName: 'Main Family Home',
      },
      ipAddress: '192.168.1.100',
    },
  });

  await prisma.userActivityLog.create({
    data: {
      userId: testUser1.id,
      action: 'CREATE_ASSET',
      resource: 'assets',
      metadata: {
        assetId: hvacAsset.id,
        assetName: 'Central Air Conditioning',
        propertyId: property1.id,
      },
      ipAddress: '192.168.1.100',
    },
  });

  console.log('✅ Created activity logs');
  console.log('🌱 Database seeding completed successfully!');
  
  // Print summary
  console.log('\n📊 Seeded data summary:');
  console.log(`- Users: 2`);
  console.log(`- Properties: 2`);
  console.log(`- Assets: 3`);
  console.log(`- Maintenance Schedules: 2`);
  console.log(`- Maintenance Tasks: 2`);
  console.log(`- Service Records: 2`);
  console.log(`- Activity Logs: 2`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });