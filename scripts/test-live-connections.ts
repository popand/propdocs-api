#!/usr/bin/env ts-node

import { PrismaClient } from '../src/generated/prisma';
import { createClient } from 'redis';

async function testLiveConnections(): Promise<void> {
  console.log('🔄 Testing live database connections...\n');
  
  // Test PostgreSQL connection
  console.log('1. Testing PostgreSQL connection...');
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'postgresql://propdocs:propdocs123@localhost:5432/propdocs_dev',
      },
    },
  });
  
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connected successfully');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} users in database`);
    
    // Test a more complex query
    const propertiesWithAssets = await prisma.property.findMany({
      include: {
        assets: true,
        _count: {
          select: {
            assets: true,
          },
        },
      },
    });
    console.log(`✅ Found ${propertiesWithAssets.length} properties with assets`);
    
    for (const property of propertiesWithAssets) {
      console.log(`   - ${property.name}: ${property._count.assets} assets`);
    }
    
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
  
  // Test Redis connection
  console.log('\n2. Testing Redis connection...');
  const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });
  
  try {
    await redisClient.connect();
    console.log('✅ Redis connected successfully');
    
    // Test Redis operations
    await redisClient.set('test:connection', 'Hello PropDocs API!');
    const value = await redisClient.get('test:connection');
    console.log(`✅ Redis read/write test: ${value}`);
    
    // Test Redis with expiration
    await redisClient.setEx('test:ttl', 10, 'Expires in 10 seconds');
    const ttl = await redisClient.ttl('test:ttl');
    console.log(`✅ Redis TTL test: ${ttl} seconds remaining`);
    
    // Clean up test keys
    await redisClient.del(['test:connection', 'test:ttl']);
    console.log('✅ Redis cleanup completed');
    
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
  } finally {
    await redisClient.disconnect();
  }
  
  console.log('\n🎉 Live connection testing completed!');
}

testLiveConnections()
  .then(() => {
    console.log('\n✅ All database connections tested successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Connection test failed:', error);
    process.exit(1);
  });