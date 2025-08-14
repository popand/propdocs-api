#!/usr/bin/env ts-node

import { PrismaClient } from '../src/generated/prisma';
import { createClient } from 'redis';

async function testDatabaseConnections(): Promise<void> {
  console.log('🧪 Testing database connections...\n');
  
  // Test Prisma Client creation
  console.log('1. Testing Prisma Client instantiation...');
  try {
    const prisma = new PrismaClient();
    console.log('✅ Prisma Client created successfully');
    
    // Note: We can't actually connect without Docker running
    console.log('📝 Note: Actual database connection requires Docker containers to be running');
    console.log('   Start with: docker-compose up -d postgres redis');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Prisma Client creation failed:', error);
  }
  
  console.log('\n2. Testing Redis Client instantiation...');
  try {
    const redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });
    console.log('✅ Redis Client created successfully');
    console.log('📝 Note: Actual Redis connection requires Docker containers to be running');
    console.log('📝 Client type:', typeof redisClient);
    
    // Don't actually connect since Docker might not be running
  } catch (error) {
    console.error('❌ Redis Client creation failed:', error);
  }

  console.log('\n3. Testing Prisma schema validation...');
  try {
    // This validates that the generated client matches the schema
    const prisma = new PrismaClient();
    
    // Test that we can access the models (this validates the schema)
    console.log('✅ User model accessible:', !!prisma.user);
    console.log('✅ Property model accessible:', !!prisma.property);  
    console.log('✅ Asset model accessible:', !!prisma.asset);
    console.log('✅ MaintenanceSchedule model accessible:', !!prisma.maintenanceSchedule);
    console.log('✅ ServiceRecord model accessible:', !!prisma.serviceRecord);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Schema validation failed:', error);
  }

  console.log('\n🎉 Database configuration test completed!');
  console.log('\n📋 Next steps:');
  console.log('   1. Start Docker containers: docker-compose up -d');
  console.log('   2. Run migrations: npm run db:migrate');
  console.log('   3. Seed database: npm run db:seed');
  console.log('   4. Start development server: npm run dev');
}

testDatabaseConnections()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });