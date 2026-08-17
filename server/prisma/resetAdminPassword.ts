import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Force override environment variables from .env
dotenv.config({ path: path.join(__dirname, '../.env'), override: true });

const prisma = new PrismaClient();

async function main() {
  const newPassword = process.argv[2] || 'Password123!';
  const targetEmail = process.argv[3] || process.env.ADMIN_EMAIL || 'admin@tribhuvancollege.ac.in';

  console.log(`🔐 Resetting admin password(s) to "${newPassword}"...`);

  // Find all admin accounts in the database
  const adminUsers = await prisma.user.findMany({
    where: { role: Role.ADMIN },
  });

  if (adminUsers.length === 0) {
    console.error('❌ No admin user found in the database!');
    process.exit(1);
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);

  for (const admin of adminUsers) {
    await prisma.user.update({
      where: { id: admin.id },
      data: { password: hashedPassword },
    });
    console.log(`✅ Admin password reset successfully for: ${admin.email}`);
  }

  console.log(`\n🎉 Admin Login Credentials:`);
  adminUsers.forEach((admin) => {
    console.log(`   Email: ${admin.email}`);
  });
  console.log(`   Password: ${newPassword}\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error resetting admin password:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

