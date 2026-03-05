import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default users
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@insurtech.com' },
    update: {},
    create: {
      email: 'admin@insurtech.com',
      password: hashedPassword,
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: hashedPassword,
    },
  });

  console.log('Seed completed successfully.');
  console.log('Default credentials:');
  console.log('  Email: user@example.com');
  console.log('  Password: Password123!');
}

main()
  .catch((error) => {
    console.error('Seed error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
