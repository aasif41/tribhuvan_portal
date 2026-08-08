import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';
import { GraduationCap, Users, Clock, Megaphone, FileDown, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageSkeleton } from '../../components/ui/Skeleton';

interface DashboardStats { 
  totalStudents: number; 
  totalTeachers: number; 
  pendingApprovals: number; 
  totalSubjects: number; 
  totalAnnouncements: number; 
  recentRegistrations: Array<{ id: string; name: string; email: string; role: string; status: string; createdAt: string }>; 
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/users/stats').then((r) => { setStats(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleDownloadCSV = async () => {
    try {
      setDownloading(true);
      const res = await api.get('/audit/export', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `Tribhuvan_College_Audit_Report_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download audit CSV:', err);
      alert('Failed to download audit CSV file.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <PageSkeleton />;

  const statCards = [
    { label: 'Total Students', value: stats?.totalStudents || 0, icon: GraduationCap, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Teachers', value: stats?.totalTeachers || 0, icon: Users, color: 'bg-green-50 text-green-600' },
    { label: 'Pending Approvals', value: stats?.pendingApprovals || 0, icon: Clock, color: 'bg-amber-50 text-amber-600' },
    { label: 'Announcements', value: stats?.totalAnnouncements || 0, icon: Megaphone, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader title="Admin Dashboard" subtitle="Manage Tribhuvan College Portal" />
        <Button
          variant="gold"
          onClick={handleDownloadCSV}
          disabled={downloading}
          className="flex items-center gap-2 shadow-sm"
        >
          {downloading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <FileDown size={16} />
          )}
          <span>{downloading ? 'Exporting...' : 'Download Audit CSV'}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label} hover>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon size={24} />
              </div>
              <div>
                <p className="text-sm text-brand-muted">{s.label}</p>
                <p className="text-2xl font-bold text-brand-text">{s.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-brand-text mb-4">Recent Registrations</h3>
          <div className="space-y-2">
            {stats?.recentRegistrations.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-brand-bg rounded-lg">
                <div>
                  <p className="font-medium text-brand-text text-sm">{r.name}</p>
                  <p className="text-xs text-brand-muted">{r.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-navy/10 text-navy px-2 py-1 rounded-full">{r.role}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${r.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : r.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{r.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-brand-text mb-4">Quick Management & Audits</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={handleDownloadCSV}
              disabled={downloading}
              className="flex flex-col items-center justify-center p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl hover:border-gold hover:bg-gold/5 transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 bg-white shadow-sm rounded-full flex items-center justify-center text-slate-700 mb-3 group-hover:scale-110 group-hover:text-gold transition-all">
                <FileDown size={24} />
              </div>
              <span className="font-medium text-navy">Download Audit CSV</span>
              <span className="text-xs text-slate-500 mt-1 text-center">Export system audit logs & records</span>
            </button>

            <button 
              onClick={() => navigate('/admin/audit')}
              className="flex flex-col items-center justify-center p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 bg-white shadow-sm rounded-full flex items-center justify-center text-slate-700 mb-3 group-hover:scale-110 group-hover:text-blue-500 transition-all">
                <ShieldCheck size={24} />
              </div>
              <span className="font-medium text-navy">View Audit Trail</span>
              <span className="text-xs text-slate-500 mt-1 text-center">Inspect system security event log</span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
