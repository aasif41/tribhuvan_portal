import prisma from '../../config/database';
import { parsePagination, buildPaginatedResult, getSkip } from '../../utils/pagination';
import { logAuditEvent } from '../audit/audit.service';

interface CreateAnnouncementPayload {
  title: string;
  body: string;
  category: string;
}

export async function listAnnouncements(query: Record<string, unknown>) {
  const pagination = parsePagination(query);
  const where: Record<string, unknown> = {};

  if (query.category) {
    where.category = query.category;
  }

  const [announcements, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: getSkip(pagination),
      take: pagination.limit,
    }),
    prisma.announcement.count({ where }),
  ]);

  return buildPaginatedResult(announcements, total, pagination);
}

export async function createAnnouncement(
  payload: CreateAnnouncementPayload,
  postedBy: string,
  userName?: string,
  userRole?: string
) {
  const announcement = await prisma.announcement.create({
    data: {
      title: payload.title,
      body: payload.body,
      category: payload.category,
      postedBy,
    },
  });

  await logAuditEvent({
    action: 'ANNOUNCEMENT_CREATED',
    category: 'ACADEMICS',
    performedBy: userName || postedBy,
    role: userRole || 'TEACHER',
    details: `Posted announcement: "${payload.title}" [${payload.category}]`,
  });

  return announcement;
}

export async function deleteAnnouncement(id: string, userName?: string, userRole?: string) {
  const announcement = await prisma.announcement.delete({ where: { id } });

  await logAuditEvent({
    action: 'ANNOUNCEMENT_DELETED',
    category: 'ACADEMICS',
    performedBy: userName || 'User',
    role: userRole || 'ADMIN',
    details: `Deleted announcement: "${announcement.title}"`,
  });

  return announcement;
}
