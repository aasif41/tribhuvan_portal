import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { AnnouncementCard } from '../../components/shared/AnnouncementCard';
import api from '../../services/api';
import type { Announcement } from '@tribhuvan/shared';
import { ANNOUNCEMENT_CATEGORIES } from '@tribhuvan/shared';

import { ListSkeleton } from '../../components/ui/Skeleton';

export function ManageAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', category: 'general' });
  const [submitting, setSubmitting] = useState(false);

  const fetch = () => { api.get('/announcements?limit=50').then((r) => { setAnnouncements(r.data.data.data || []); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(() => { fetch(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try { await api.post('/announcements', form); setShowModal(false); setForm({ title: '', body: '', category: 'general' }); fetch(); }
    catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this announcement?')) {
      await api.delete(`/announcements/${id}`); fetch();
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Manage Announcements" />
        <ListSkeleton items={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Manage Announcements" action={<Button variant="gold" onClick={() => setShowModal(true)}>+ New Announcement</Button>} />
      <div className="space-y-3">
        {announcements.map((a) => <AnnouncementCard key={a.id} announcement={a} showDelete onDelete={handleDelete} />)}
        {announcements.length === 0 && <Card><p className="text-center text-brand-muted py-8">No announcements yet</p></Card>}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Announcement">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-brand-text">Category</label>
            <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="input-field">
              {ANNOUNCEMENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-brand-text">Body</label>
            <textarea value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} className="input-field min-h-[120px]" required />
          </div>
          <Button type="submit" variant="gold" loading={submitting} className="w-full">Publish</Button>
        </form>
      </Modal>
    </div>
  );
}
