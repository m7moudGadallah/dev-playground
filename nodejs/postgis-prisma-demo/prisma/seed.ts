import { PrismaClient } from '@prisma/client';
import path from 'path';
import { readFileSync } from 'fs';

const prisma = new PrismaClient();

async function main() {
  const restaurantsDataFilePath = path.join(
    __dirname,
    '..',
    'data',
    'restaurants.json'
  );

  const restaurantsData = JSON.parse(
    readFileSync(restaurantsDataFilePath, 'utf8')
  );

  await prisma.$transaction(async (prisma) => {
    const createRestaurantPromises = restaurantsData.map((restaurant: any) => {
      return prisma.$executeRaw`
        INSERT INTO "public"."restaurants" (name, description, location) 
        VALUES (
          ${restaurant.name}, 
          ${restaurant.description}, 
          ST_SetSRID(ST_MakePoint(${restaurant.location.longitude}, ${restaurant.location.latitude}), 4326)
        )
      `;
    });

    await Promise.all(createRestaurantPromises);
  });

  console.log('Database has been seeded with restaurant data.');
}

main()
  .then()
  .catch((error) => {
    console.error('Failed to seed data: ', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
