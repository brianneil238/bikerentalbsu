import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create a test user
  console.log('👤 Creating test user...');
  const testUserEmail = 'test@bsu.edu.ph';
  
  const existingUser = await prisma.user.findUnique({
    where: { email: testUserEmail },
  });

  if (!existingUser) {
    const hashedPassword = await hash('password123', 12);
    
    await prisma.user.create({
      data: {
        email: testUserEmail,
        name: 'Test User',
        password: hashedPassword,
        role: 'STUDENT',
      },
    });
    console.log('✅ Created test user: test@bsu.edu.ph (password: password123)');
  } else {
    console.log('⏭️ Test user already exists, skipping...');
  }

  // Create some sample bikes
  const bikes = [
    {
      bikeNumber: 'BSU-001',
      model: 'Standard Bike',
      currentLocation: {
        lat: 16.4023,
        lng: 120.5960
      },
      purchaseDate: new Date('2024-01-15'),
    },
    {
      bikeNumber: 'BSU-002', 
      model: 'Standard Bike',
      currentLocation: {
        lat: 16.4025,
        lng: 120.5962
      },
      purchaseDate: new Date('2024-01-15'),
    },
    {
      bikeNumber: 'BSU-003',
      model: 'Standard Bike',
      currentLocation: {
        lat: 16.4027,
        lng: 120.5965
      },
      purchaseDate: new Date('2024-01-20'),
    },
    {
      bikeNumber: 'BSU-004',
      model: 'Standard Bike',
      currentLocation: {
        lat: 16.4021,
        lng: 120.5958
      },
      purchaseDate: new Date('2024-01-20'),
    },
    {
      bikeNumber: 'BSU-005',
      model: 'Standard Bike',
      currentLocation: {
        lat: 16.4029,
        lng: 120.5967
      },
      purchaseDate: new Date('2024-01-25'),
    },
    {
      bikeNumber: 'BSU-006',
      model: 'Standard Bike',
      currentLocation: {
        lat: 16.4031,
        lng: 120.5969
      },
      purchaseDate: new Date('2024-02-01'),
    },
    {
      bikeNumber: 'BSU-007',
      model: 'Standard Bike',
      currentLocation: {
        lat: 16.4019,
        lng: 120.5956
      },
      purchaseDate: new Date('2024-02-01'),
    },
    {
      bikeNumber: 'BSU-008',
      model: 'Standard Bike',
      currentLocation: {
        lat: 16.4033,
        lng: 120.5971
      },
      purchaseDate: new Date('2024-02-05'),
    },
    {
      bikeNumber: 'BSU-009',
      model: 'Standard Bike',
      currentLocation: {
        lat: 16.4017,
        lng: 120.5954
      },
      purchaseDate: new Date('2024-02-05'),
    },
    {
      bikeNumber: 'BSU-010',
      model: 'Standard Bike',
      currentLocation: {
        lat: 16.4035,
        lng: 120.5973
      },
      purchaseDate: new Date('2024-02-10'),
    },
  ];

  console.log('🚲 Creating bikes...');
  
  for (const bikeData of bikes) {
    const existingBike = await prisma.bike.findUnique({
      where: { bikeNumber: bikeData.bikeNumber },
    });

    if (!existingBike) {
      await prisma.bike.create({
        data: {
          ...bikeData,
          status: 'AVAILABLE',
          isActive: true,
        },
      });
      console.log(`✅ Created bike: ${bikeData.bikeNumber}`);
    } else {
      console.log(`⏭️ Bike ${bikeData.bikeNumber} already exists, skipping...`);
    }
  }

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 