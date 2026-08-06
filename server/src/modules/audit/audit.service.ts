import prisma from '../../config/database';

export interface CreateAuditInput {
  action: string;
  category?: string;
  performedBy: string;
  role?: string;
  details: string;
  ipAddress?: string;
}

export async function logAuditEvent(input: CreateAuditInput) {
  try {
    return await prisma.auditLog.create({
      data: {
        action: input.action,
        category: input.category || 'SYSTEM',
        performedBy: input.performedBy,
        role: input.role || 'ADMIN',
        details: input.details,
        ipAddress: input.ipAddress || null,
      },
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

export async function getAuditLogs() {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function generateAuditCSV(): Promise<string> {
  const logs = await getAuditLogs();
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const escapeCSV = (field: any): string => {
    if (field === null || field === undefined) return '""';
    const stringVal = String(field).replace(/"/g, '""');
    return `"${stringVal}"`;
  };

  const rows: string[] = [];

  // Header Section
  rows.push('"=== TRIBHUVAN COLLEGE PORTAL - SYSTEM AUDIT REPORT ==="');
  rows.push(`"Generated At: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}"`);
  rows.push(`"Total Audit Logs: ${logs.length}"`);
  rows.push(`"Total Registered Accounts: ${users.length}"`);
  rows.push('""'); // Empty line separator

  // Audit Logs Table Header
  rows.push('"Log ID","Timestamp (UTC)","Action","Category","Performed By","Role","Details","IP Address"');

  // Audit Logs Rows
  for (const log of logs) {
    rows.push(
      [
        escapeCSV(log.id),
        escapeCSV(log.createdAt.toISOString()),
        escapeCSV(log.action),
        escapeCSV(log.category),
        escapeCSV(log.performedBy),
        escapeCSV(log.role),
        escapeCSV(log.details),
        escapeCSV(log.ipAddress || 'N/A'),
      ].join(',')
    );
  }

  rows.push('""');
  rows.push('"=== SYSTEM REGISTERED USERS AUDIT SUMMARY ==="');
  rows.push('"User ID","Full Name","Email Address","Account Role","Approval Status","Registered Date"');

  for (const u of users) {
    rows.push(
      [
        escapeCSV(u.id),
        escapeCSV(u.name),
        escapeCSV(u.email),
        escapeCSV(u.role),
        escapeCSV(u.status),
        escapeCSV(u.createdAt.toISOString()),
      ].join(',')
    );
  }

  return rows.join('\n');
}
