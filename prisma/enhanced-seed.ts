import { 
  PrismaClient, 
  SubscriptionTier, 
  PropertyType, 
  AssetCategory, 
  AssetCondition, 
  MaintenanceFrequency, 
  MaintenancePriority, 
  TaskStatus,
  PropertySharingLevel,
  PropertyRole,
  NotificationType
} from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Starting enhanced database seeding...');

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.propertyShare.deleteMany();
  await prisma.propertyAccess.deleteMany();
  await prisma.assetHierarchy.deleteMany();
  await prisma.serviceRecord.deleteMany();
  await prisma.maintenanceTask.deleteMany();
  await prisma.maintenanceSchedule.deleteMany();
  await prisma.assetDocument.deleteMany();
  await prisma.assetPhoto.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.propertyPhoto.deleteMany();
  await prisma.property.deleteMany();
  await prisma.userActivityLog.deleteMany();
  await prisma.userPreferences.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.serviceProvider.deleteMany();
  await prisma.maintenanceTemplate.deleteMany();
  await prisma.user.deleteMany();

  // Create test users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@propdocs.dev',
        name: 'John Doe',
        subscriptionTier: SubscriptionTier.PREMIUM,
        appleId: 'apple_john_123',
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@propdocs.dev',
        name: 'Jane Smith',
        subscriptionTier: SubscriptionTier.FREE,
        googleId: 'google_jane_456',
      },
    }),
    prisma.user.create({
      data: {
        email: 'mike.johnson@propdocs.dev',
        name: 'Mike Johnson',
        subscriptionTier: SubscriptionTier.PROFESSIONAL,
      },
    }),
    prisma.user.create({
      data: {
        email: 'sarah.wilson@propdocs.dev',
        name: 'Sarah Wilson',
        subscriptionTier: SubscriptionTier.PREMIUM,
        appleId: 'apple_sarah_789',
      },
    }),
  ]);

  console.log('✅ Created test users');

  // Create user preferences
  await Promise.all(users.map(user => 
    prisma.userPreferences.create({
      data: {
        userId: user.id,
        emailNotifications: true,
        pushNotifications: true,
        maintenanceReminders: true,
        timezone: user.email.includes('sarah') ? 'America/Los_Angeles' : 'America/New_York',
        temperatureUnit: user.email.includes('mike') ? 'C' : 'F',
      },
    })
  ));

  // Create service providers
  const serviceProviders = await Promise.all([
    prisma.serviceProvider.create({
      data: {
        name: 'Cool Air HVAC Services',
        contact: '(555) 123-4567',
        email: 'info@coolair.com',
        phone: '(555) 123-4567',
        website: 'https://coolair.com',
        specialties: ['HVAC', 'Air Conditioning', 'Heating', 'Ductwork'],
        rating: 4.8,
        notes: 'Reliable HVAC service provider with 24/7 emergency service',
      },
    }),
    prisma.serviceProvider.create({
      data: {
        name: 'All-Pro Appliance Repair',
        contact: 'support@allproappliance.com',
        email: 'support@allproappliance.com',
        phone: '(555) 987-6543',
        specialties: ['Appliances', 'Refrigeration', 'Laundry', 'Kitchen'],
        rating: 4.5,
        notes: 'Specializes in major appliance repair and maintenance',
      },
    }),
    prisma.serviceProvider.create({
      data: {
        name: 'Premier Plumbing Solutions',
        contact: '(555) 456-7890',
        phone: '(555) 456-7890',
        specialties: ['Plumbing', 'Water Heaters', 'Pipe Repair'],
        rating: 4.9,
        notes: 'Licensed and insured plumbing contractor',
      },
    }),
  ]);

  // Create maintenance templates
  await Promise.all([
    prisma.maintenanceTemplate.create({
      data: {
        title: 'HVAC Filter Replacement',
        description: 'Replace air filters and inspect airflow',
        frequency: MaintenanceFrequency.QUARTERLY,
        priority: MaintenancePriority.HIGH,
        estimatedCost: 45,
        estimatedTime: 30,
        category: AssetCategory.HVAC,
        assetTypes: ['Central Air Conditioner', 'Furnace', 'Heat Pump'],
      },
    }),
    prisma.maintenanceTemplate.create({
      data: {
        title: 'Refrigerator Coil Cleaning',
        description: 'Clean condenser coils and check door seals',
        frequency: MaintenanceFrequency.SEMI_ANNUAL,
        priority: MaintenancePriority.MEDIUM,
        estimatedCost: 0,
        estimatedTime: 45,
        category: AssetCategory.APPLIANCES,
        assetTypes: ['Refrigerator'],
      },
    }),
    prisma.maintenanceTemplate.create({
      data: {
        title: 'Water Heater Inspection',
        description: 'Check anode rod, flush tank, inspect for leaks',
        frequency: MaintenanceFrequency.ANNUAL,
        priority: MaintenancePriority.HIGH,
        estimatedCost: 150,
        estimatedTime: 90,
        category: AssetCategory.PLUMBING,
        assetTypes: ['Water Heater'],
      },
    }),
  ]);

  // Create properties
  const properties = await Promise.all([
    prisma.property.create({
      data: {
        name: 'John\'s Family Home',
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
        ownerId: users[0].id,
        latitude: 39.7817,
        longitude: -89.6501,
      },
    }),
    prisma.property.create({
      data: {
        name: 'Jane\'s Downtown Condo',
        type: PropertyType.CONDO,
        address: '456 Oak Avenue, Unit 5B',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        yearBuilt: 2020,
        squareFeet: 1200,
        bedrooms: 2,
        bathrooms: 2,
        description: 'Modern downtown condominium with city views',
        ownerId: users[1].id,
        latitude: 41.8781,
        longitude: -87.6298,
      },
    }),
    prisma.property.create({
      data: {
        name: 'Mike\'s Investment Property',
        type: PropertyType.TOWNHOUSE,
        address: '789 Pine Lane',
        city: 'Austin',
        state: 'TX',
        zipCode: '73301',
        yearBuilt: 2018,
        squareFeet: 1800,
        bedrooms: 3,
        bathrooms: 2.5,
        description: 'Well-maintained townhouse in desirable neighborhood',
        ownerId: users[2].id,
        latitude: 30.2672,
        longitude: -97.7431,
      },
    }),
    prisma.property.create({
      data: {
        name: 'Sarah\'s Beach House',
        type: PropertyType.HOUSE,
        address: '321 Ocean Drive',
        city: 'Santa Monica',
        state: 'CA',
        zipCode: '90401',
        yearBuilt: 2010,
        squareFeet: 3200,
        bedrooms: 5,
        bathrooms: 4,
        description: 'Stunning beach house with ocean views',
        ownerId: users[3].id,
        latitude: 34.0195,
        longitude: -118.4912,
      },
    }),
  ]);

  console.log('✅ Created test properties');

  // Create property photos
  await Promise.all([
    prisma.propertyPhoto.create({
      data: {
        propertyId: properties[0].id,
        url: 'https://example.com/photos/property1-front.jpg',
        thumbnail: 'https://example.com/photos/property1-front-thumb.jpg',
        caption: 'Front view of the house',
        order: 0,
      },
    }),
    prisma.propertyPhoto.create({
      data: {
        propertyId: properties[0].id,
        url: 'https://example.com/photos/property1-living.jpg',
        thumbnail: 'https://example.com/photos/property1-living-thumb.jpg',
        caption: 'Living room',
        order: 1,
      },
    }),
  ]);

  // Create property sharing and access
  await prisma.propertyShare.create({
    data: {
      propertyId: properties[0].id,
      shareToken: 'share-token-12345',
      level: PropertySharingLevel.SHARED_LINK,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      allowDownload: true,
      viewCount: 5,
      createdBy: users[0].id,
    },
  });

  await prisma.propertyAccess.create({
    data: {
      propertyId: properties[2].id,
      userId: users[3].id,
      role: PropertyRole.VIEWER,
      grantedBy: users[2].id,
    },
  });

  // Create assets
  const assets = await Promise.all([
    // HVAC System for Property 1
    prisma.asset.create({
      data: {
        propertyId: properties[0].id,
        name: 'Central Air Conditioning System',
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
    }),
    // Kitchen Appliances
    prisma.asset.create({
      data: {
        propertyId: properties[0].id,
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
    }),
    // Water Heater
    prisma.asset.create({
      data: {
        propertyId: properties[0].id,
        name: 'Gas Water Heater',
        category: AssetCategory.PLUMBING,
        type: 'Gas Tank Water Heater',
        brand: 'Rheem',
        model: 'Performance Platinum 50 Gal',
        serialNumber: 'RHM2024-WH-789',
        purchaseDate: new Date('2017-08-10'),
        installationDate: new Date('2017-08-15'),
        warrantyExpiry: new Date('2027-08-15'),
        purchasePrice: 1200.00,
        condition: AssetCondition.GOOD,
        location: 'Basement',
        room: 'Utility Room',
        specifications: {
          capacity: '50 gallons',
          efficiency: '0.95 UEF',
          fuelType: 'Natural Gas',
        },
      },
    }),
    // Condo appliances
    prisma.asset.create({
      data: {
        propertyId: properties[1].id,
        name: 'Washer/Dryer Combo',
        category: AssetCategory.APPLIANCES,
        type: 'Combo Washer Dryer',
        brand: 'Whirlpool',
        model: 'WFC8090GX',
        serialNumber: 'WP2024-WD-101',
        purchaseDate: new Date('2020-08-10'),
        installationDate: new Date('2020-08-15'),
        warrantyExpiry: new Date('2022-08-15'),
        purchasePrice: 1299.00,
        condition: AssetCondition.GOOD,
        location: 'Utility Closet',
        room: 'Laundry',
      },
    }),
  ]);

  console.log('✅ Created test assets');

  // Create asset hierarchy (HVAC system components)
  const hvacComponents = await Promise.all([
    prisma.asset.create({
      data: {
        propertyId: properties[0].id,
        name: 'Main Ductwork',
        category: AssetCategory.HVAC,
        type: 'Ductwork System',
        condition: AssetCondition.GOOD,
        location: 'Throughout House',
        specifications: {
          material: 'Galvanized Steel',
          insulation: 'R-8',
        },
      },
    }),
    prisma.asset.create({
      data: {
        propertyId: properties[0].id,
        name: 'Programmable Thermostat',
        category: AssetCategory.HVAC,
        type: 'Smart Thermostat',
        brand: 'Nest',
        model: 'Learning Thermostat 4th Gen',
        condition: AssetCondition.EXCELLENT,
        location: 'Living Room',
        room: 'Living Room',
      },
    }),
  ]);

  // Create asset hierarchy relationships
  await Promise.all([
    prisma.assetHierarchy.create({
      data: {
        parentId: assets[0].id, // HVAC System
        childId: hvacComponents[0].id, // Ductwork
        systemName: 'Central HVAC System',
      },
    }),
    prisma.assetHierarchy.create({
      data: {
        parentId: assets[0].id, // HVAC System
        childId: hvacComponents[1].id, // Thermostat
        systemName: 'Central HVAC System',
      },
    }),
  ]);

  // Create asset photos and documents
  await Promise.all([
    prisma.assetPhoto.create({
      data: {
        assetId: assets[0].id,
        url: 'https://example.com/photos/hvac-unit-exterior.jpg',
        thumbnail: 'https://example.com/photos/hvac-unit-exterior-thumb.jpg',
        caption: 'Exterior HVAC unit',
        order: 0,
      },
    }),
    prisma.assetDocument.create({
      data: {
        assetId: assets[0].id,
        name: 'HVAC Installation Manual',
        type: 'MANUAL',
        url: 'https://example.com/docs/hvac-manual.pdf',
        size: 2048000,
        mimeType: 'application/pdf',
        description: 'Complete installation and maintenance manual',
      },
    }),
    prisma.assetDocument.create({
      data: {
        assetId: assets[1].id,
        name: 'Refrigerator Warranty',
        type: 'WARRANTY',
        url: 'https://example.com/docs/lg-warranty.pdf',
        size: 512000,
        mimeType: 'application/pdf',
        description: 'Original warranty documentation',
      },
    }),
  ]);

  // Create maintenance schedules
  const maintenanceSchedules = await Promise.all([
    prisma.maintenanceSchedule.create({
      data: {
        assetId: assets[0].id,
        title: 'HVAC Filter Replacement',
        description: 'Replace air filters and inspect system',
        frequency: MaintenanceFrequency.QUARTERLY,
        interval: 1,
        startDate: new Date('2024-01-01'),
        nextDue: new Date('2024-10-01'),
        priority: MaintenancePriority.HIGH,
        estimatedCost: 45.00,
        estimatedTime: 30,
      },
    }),
    prisma.maintenanceSchedule.create({
      data: {
        assetId: assets[1].id,
        title: 'Refrigerator Coil Cleaning',
        description: 'Clean condenser coils and check seals',
        frequency: MaintenanceFrequency.SEMI_ANNUAL,
        interval: 1,
        startDate: new Date('2024-01-01'),
        nextDue: new Date('2024-07-01'),
        priority: MaintenancePriority.MEDIUM,
        estimatedCost: 0.00,
        estimatedTime: 45,
      },
    }),
    prisma.maintenanceSchedule.create({
      data: {
        assetId: assets[2].id,
        title: 'Water Heater Annual Service',
        description: 'Check anode rod, flush tank, inspect for leaks',
        frequency: MaintenanceFrequency.ANNUAL,
        interval: 1,
        startDate: new Date('2024-01-01'),
        nextDue: new Date('2024-09-15'),
        priority: MaintenancePriority.HIGH,
        estimatedCost: 150.00,
        estimatedTime: 90,
      },
    }),
  ]);

  console.log('✅ Created maintenance schedules');

  // Create maintenance tasks
  const maintenanceTasks = await Promise.all([
    prisma.maintenanceTask.create({
      data: {
        scheduleId: maintenanceSchedules[0].id,
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
    }),
    prisma.maintenanceTask.create({
      data: {
        scheduleId: maintenanceSchedules[0].id,
        title: 'Q2 2024 HVAC Filter Replacement',
        description: 'Replace all air filters in the system',
        dueDate: new Date('2024-07-01'),
        status: TaskStatus.COMPLETED,
        completedAt: new Date('2024-06-28'),
        completedBy: 'John Doe',
        notes: 'Replaced filters, noticed system efficiency improved',
        actualCost: 45.00,
        actualTime: 30,
      },
    }),
    prisma.maintenanceTask.create({
      data: {
        scheduleId: maintenanceSchedules[0].id,
        title: 'Q3 2024 HVAC Filter Replacement',
        description: 'Replace all air filters in the system',
        dueDate: new Date('2024-10-01'),
        status: TaskStatus.PENDING,
      },
    }),
    prisma.maintenanceTask.create({
      data: {
        scheduleId: maintenanceSchedules[2].id,
        title: '2024 Water Heater Service',
        description: 'Annual water heater maintenance and inspection',
        dueDate: new Date('2024-09-15'),
        status: TaskStatus.OVERDUE,
      },
    }),
  ]);

  // Create service records
  await Promise.all([
    prisma.serviceRecord.create({
      data: {
        assetId: assets[0].id,
        taskId: maintenanceTasks[0].id,
        title: 'HVAC System Professional Inspection',
        description: 'Annual professional inspection and tune-up',
        serviceDate: new Date('2024-03-15'),
        providerId: serviceProviders[0].id,
        cost: 180.00,
        laborCost: 120.00,
        partsCost: 60.00,
        warrantyPeriod: 90,
        notes: 'System in excellent condition. Refrigerant levels good. Minor coil cleaning performed.',
      },
    }),
    prisma.serviceRecord.create({
      data: {
        assetId: assets[1].id,
        title: 'Refrigerator Water Filter Replacement',
        description: 'Replaced water filter cartridge',
        serviceDate: new Date('2024-02-10'),
        providerId: serviceProviders[1].id,
        cost: 35.99,
        partsCost: 35.99,
        notes: 'Water filter replaced. Improved water taste and flow.',
      },
    }),
  ]);

  console.log('✅ Created service records');

  // Create notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: users[0].id,
        type: NotificationType.MAINTENANCE_DUE,
        title: 'HVAC Filter Replacement Due',
        message: 'Your quarterly HVAC filter replacement is due on October 1st.',
        data: {
          assetId: assets[0].id,
          taskId: maintenanceTasks[2].id,
          dueDate: '2024-10-01',
        },
        scheduledFor: new Date('2024-09-24'), // 1 week before
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[0].id,
        type: NotificationType.MAINTENANCE_OVERDUE,
        title: 'Water Heater Service Overdue',
        message: 'Your water heater annual service was due on September 15th and is now overdue.',
        data: {
          assetId: assets[2].id,
          taskId: maintenanceTasks[3].id,
          overdueBy: 10,
        },
        isRead: false,
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[0].id,
        type: NotificationType.WARRANTY_EXPIRING,
        title: 'HVAC Warranty Expiring Soon',
        message: 'Your HVAC system warranty expires in 6 months.',
        data: {
          assetId: assets[0].id,
          warrantyExpiry: '2025-06-01',
        },
      },
    }),
  ]);

  // Create activity logs
  await Promise.all([
    prisma.userActivityLog.create({
      data: {
        userId: users[0].id,
        action: 'CREATE_PROPERTY',
        resource: 'properties',
        metadata: {
          propertyId: properties[0].id,
          propertyName: 'John\'s Family Home',
        },
        ipAddress: '192.168.1.100',
      },
    }),
    prisma.userActivityLog.create({
      data: {
        userId: users[0].id,
        action: 'CREATE_ASSET',
        resource: 'assets',
        metadata: {
          assetId: assets[0].id,
          assetName: 'Central Air Conditioning System',
          propertyId: properties[0].id,
        },
        ipAddress: '192.168.1.100',
      },
    }),
    prisma.userActivityLog.create({
      data: {
        userId: users[0].id,
        action: 'COMPLETE_MAINTENANCE_TASK',
        resource: 'maintenance_tasks',
        metadata: {
          taskId: maintenanceTasks[0].id,
          taskTitle: 'Q1 2024 HVAC Filter Replacement',
          completedAt: '2024-03-28',
        },
        ipAddress: '192.168.1.100',
      },
    }),
  ]);

  console.log('✅ Created activity logs and notifications');
  console.log('🌱 Enhanced database seeding completed successfully!');
  
  // Print comprehensive summary
  console.log('\n📊 Complete seeded data summary:');
  console.log(`- Users: 4 (Free: 1, Premium: 2, Professional: 1)`);
  console.log(`- User Preferences: 4`);
  console.log(`- Properties: 4 (House: 2, Condo: 1, Townhouse: 1)`);
  console.log(`- Property Photos: 2`);
  console.log(`- Property Shares: 1`);
  console.log(`- Property Access: 1`);
  console.log(`- Assets: 6 (HVAC: 3, Appliances: 2, Plumbing: 1)`);
  console.log(`- Asset Hierarchy: 2 relationships`);
  console.log(`- Asset Photos: 1`);
  console.log(`- Asset Documents: 2`);
  console.log(`- Maintenance Schedules: 3`);
  console.log(`- Maintenance Tasks: 4 (Completed: 2, Pending: 1, Overdue: 1)`);
  console.log(`- Service Records: 2`);
  console.log(`- Service Providers: 3`);
  console.log(`- Maintenance Templates: 3`);
  console.log(`- Notifications: 3`);
  console.log(`- Activity Logs: 3`);
  
  console.log('\n🎯 Database ready for comprehensive testing and development!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Enhanced seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });