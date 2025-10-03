import { PrismaClient } from '@prisma/client';
import { hashPassword } from './utils';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Hash the password
    const hashedPassword = await hashPassword('masuk123');
    
    // Create the admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@jaga24.com' },
      update: {
        name: 'Admin User',
        role: 'ADMIN',
        password: hashedPassword,
      },
      create: {
        email: 'admin@jaga24.com',
        name: 'Admin User',
        role: 'ADMIN',
        password: hashedPassword,
      },
    });

    console.log('Admin user created/updated:', adminUser.email);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();