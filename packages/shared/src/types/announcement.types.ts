export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: AnnouncementCategory;
  postedBy: string;
  createdAt: string;
  updatedAt: string;
}

export type AnnouncementCategory =
  | 'general'
  | 'academic'
  | 'exam'
  | 'event'
  | 'placement'
  | 'hostel'
  | 'urgent';

export const ANNOUNCEMENT_CATEGORIES: AnnouncementCategory[] = [
  'general',
  'academic',
  'exam',
  'event',
  'placement',
  'hostel',
  'urgent',
];

export interface CreateAnnouncementPayload {
  title: string;
  body: string;
  category: AnnouncementCategory;
}

export interface AnnouncementListResponse {
  data: Announcement[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
