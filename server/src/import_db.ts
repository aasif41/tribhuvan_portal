import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const TABLE_ORDER = [
  'User',
  'Student',
  'Teacher',
  'Subject',
  'Enrollment',
  'TimetableSlot',
  'Attendance',
  'Announcement',
  'Setting',
];

async function restoreBackup() {
  const sqlPath = path.resolve(__dirname, '../../supabase_backup.sql');
  console.log(`Reading SQL file from: ${sqlPath}`);
  
  if (!fs.existsSync(sqlPath)) {
    console.error(`❌ Backup file not found at ${sqlPath}`);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
  
  // Extract all INSERT INTO statements cleanly
  const allLines = sqlContent.split('\n');
  const rawStatements: string[] = [];

  for (const line of allLines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('INSERT INTO')) {
      rawStatements.push(trimmed);
    }
  }

  console.log(`Extracted ${rawStatements.length} INSERT statements from SQL backup file.`);

  // Reset database before importing
  console.log('Resetting database schema...');
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "User", "Student", "Teacher", "Subject", "Enrollment", "TimetableSlot", "Attendance", "Announcement", "Setting" CASCADE;`);

  // Group statements by target table
  const statementsByTable: Record<string, string[]> = {};
  for (const table of TABLE_ORDER) {
    statementsByTable[table] = [];
  }

  for (const stmt of rawStatements) {
    for (const table of TABLE_ORDER) {
      if (stmt.startsWith(`INSERT INTO "${table}"`)) {
        statementsByTable[table].push(stmt);
        break;
      }
    }
  }

  let totalSuccess = 0;

  for (const table of TABLE_ORDER) {
    const tableStmts = statementsByTable[table];
    if (tableStmts.length === 0) continue;

    console.log(`Inserting ${tableStmts.length} records into "${table}"...`);
    for (const stmt of tableStmts) {
      try {
        await prisma.$executeRawUnsafe(stmt);
        totalSuccess++;
      } catch (err: any) {
        console.error(`⚠️ Error inserting into "${table}":`, err.message || err);
      }
    }
  }

  console.log(`\n🎉 Restore complete! Successfully imported ${totalSuccess}/${rawStatements.length} records into Neon Database!`);
  await prisma.$disconnect();
}

restoreBackup();
