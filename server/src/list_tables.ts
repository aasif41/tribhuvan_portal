
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listTables() {
  try {
    const tables: Array<{ table_schema: string; table_name: string; table_type: string }> = await prisma.$queryRaw`
      SELECT table_schema, table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    console.log('\nList of relations (equivalent to \\dt output):');
    console.log('Schema |      Name       | Type  | Owner');
    console.log('-------+-----------------+-------+--------------');
    tables.forEach(t => {
      console.log(`public | ${t.table_name.padEnd(15)} | table | neondb_owner`);
    });
    console.log(`(${tables.length} rows)\n`);
  } catch (err) {
    console.error('Error querying tables:', err);
  } finally {
    await prisma.$disconnect();
  }
}

listTables();
