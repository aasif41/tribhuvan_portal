import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:AtiyAsif%4045@db.clrclfuebtrpqcusxuji.supabase.co:5432/postgres';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

async function dumpDatabase() {
  console.log('Connecting to PostgreSQL database at:', dbUrl.replace(/:[^:@]+@/, ':****@'));
  let sqlDump = `-- Supabase PostgreSQL Backup Dump\n-- Generated on ${new Date().toISOString()}\n\n`;

  try {
    const tables: Array<{ table_name: string }> = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `;

    console.log(`Found ${tables.length} tables:`, tables.map(t => t.table_name));

    for (const { table_name } of tables) {
      if (table_name.startsWith('_')) continue;
      
      sqlDump += `--\n-- Data for table "${table_name}"\n--\n`;
      
      const rows: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "${table_name}"`);
      console.log(`Table "${table_name}": ${rows.length} rows`);
      if (rows.length === 0) continue;

      const columns = Object.keys(rows[0]);
      const colNames = columns.map(c => `"${c}"`).join(', ');

      for (const row of rows) {
        const values = columns.map(col => {
          const val = row[col];
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'number' || typeof val === 'boolean') return `${val}`;
          if (val instanceof Date) return `'${val.toISOString()}'`;
          if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
          return `'${String(val).replace(/'/g, "''")}'`;
        }).join(', ');

        sqlDump += `INSERT INTO "${table_name}" (${colNames}) VALUES (${values}) ON CONFLICT DO NOTHING;\n`;
      }
      sqlDump += `\n`;
    }

    const outputPath = path.resolve(__dirname, '../../supabase_backup.sql');
    fs.writeFileSync(outputPath, sqlDump, 'utf-8');
    console.log(`\n✅ Backup successfully generated and saved to: ${outputPath}`);
  } catch (error) {
    console.error('❌ Error exporting database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

dumpDatabase();
