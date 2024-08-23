import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const commentsFilePath = path.join(__dirname, '..', 'data', 'comments.json');
  const commentsData = JSON.parse(readFileSync(commentsFilePath, 'utf-8'));

  await prisma.comment.createMany({
    data: commentsData,
  });

  console.log('Sample data has been seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
