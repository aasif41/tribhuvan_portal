import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Sparkles } from 'lucide-react';
import api from '../../services/api';

interface PendingUser { id: string; name: string; email: string; role: string; createdAt: string; student: { rollNo: string; program: string } | null; teacher: { employeeId: string; department: string } | null; }

export function PendingApprovals() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/pending').then((r) => { setUsers(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleAction = async (userId: string, action: 'approve' | 'reject') => {
    try {
      await api.patch(`/users/${action}/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-gold/30 border-t-gold rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Pending Approvals" subtitle={`${users.length} users awaiting approval`} />
      {users.length === 0 ? (
        <Card>
          <div className="flex items-center justify-center gap-2 py-8 text-brand-muted font-medium">
            <span>No pending approvals</span>
            <Sparkles size={18} className="text-amber-500" />
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <Card key={u.id}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-navy rounded-full flex items-center justify-center shrink-0"><span className="text-gold font-bold">{u.name.charAt(0)}</span></div>
                  <div>
                    <h4 className="font-medium text-brand-text">{u.name}</h4>
                    <p className="text-xs text-brand-muted">{u.email}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge variant="info">{u.role}</Badge>
                      {u.student && <span className="text-xs text-brand-muted">{u.student.program} • {u.student.rollNo}</span>}
                      {u.teacher && <span className="text-xs text-brand-muted">{u.teacher.department} • {u.teacher.employeeId}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  <Button variant="gold" size="sm" onClick={() => handleAction(u.id, 'approve')}>Approve</Button>
                  <Button variant="danger" size="sm" onClick={() => handleAction(u.id, 'reject')}>Reject</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
