import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create some sample bikes
  const bikes = [
    {
      bikeNumber: 'BSU-001',
      model: 'Mountain Bike Pro',
      currentLocation: {
        lat: 16.4023,
        lng: 120.5960
      },
      purchaseDate: new Date('2024-01-15'),
    },
    {
      bikeNumber: 'BSU-002', 
      model: 'City Cruiser',
      currentLocation: {
        lat: 16.4025,
        lng: 120.5962
      },
      purchaseDate: new Date('2024-01-15'),
    },
    {
      bikeNumber: 'BSU-003',
      model: 'Electric Bike',
      currentLocation: {
        lat: 16.4027,
        lng: 120.5965
      },
      purchaseDate: new Date('2024-01-20'),
    },
    {
      bikeNumber: 'BSU-004',
      model: 'Hybrid Bike',
      currentLocation: {
        lat: 16.4021,
        lng: 120.5958
      },
      purchaseDate: new Date('2024-01-20'),
    },
    {
      bikeNumber: 'BSU-005',
      model: 'Road Bike',
      currentLocation: {
        lat: 16.4029,
        lng: 120.5967
      },
      purchaseDate: new Date('2024-01-25'),
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