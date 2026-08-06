import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileDown, Search, Filter, ShieldCheck, Clock, User, FileText } from 'lucide-react';
import api from '../../services/api';

interface AuditLog {
  id: string;
  action: string;
  category: string;
  performedBy: string;
  role: string;
  details: string;
  ipAddress: string | null;
  createdAt: string;
}

export function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/audit');
      setLogs(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      setDownloading(true);
      const res = await api.get('/audit/export', {
        responseType: 'blob',
      });

      // Create download link for CSV file
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
      alert('Failed to download audit CSV file. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const categories = ['ALL', 'SECURITY', 'USER_MANAGEMENT', 'ACADEMICS', 'AUTH'];

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || log.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case 'SECURITY':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'USER_MANAGEMENT':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ACADEMICS':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'AUTH':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="System Audit Logs"
          subtitle="Track administrative operations, security events, and download system reports"
        />

        <Button
          variant="gold"
          onClick={handleDownloadCSV}
          disabled={downloading}
          className="flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
        >
          {downloading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <FileDown size={17} />
          )}
          <span>{downloading ? 'Preparing CSV...' : 'Download Audit CSV'}</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search action, user, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9 text-xs py-2 w-full"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            <Filter size={14} className="text-gray-400 shrink-0" />
            <span className="text-xs text-brand-muted font-medium mr-1">Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all font-medium ${
                  selectedCategory === cat
                    ? 'bg-[#0d1f3c] text-white border-[#0d1f3c] shadow-xs'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Audit Logs Table */}
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-gold" size={18} />
            <h3 className="text-sm font-bold text-brand-text">Audit Event Trail</h3>
          </div>
          <span className="text-xs text-brand-muted font-mono">
            {filteredLogs.length} record{filteredLogs.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-7 h-7 border-3 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FileText size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">No audit logs found matching your criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Performed By</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-brand-text">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-gray-500 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-gray-400" />
                        {new Date(log.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#0d1f3c]">
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold tracking-wide uppercase ${getCategoryBadgeClass(
                          log.category
                        )}`}
                      >
                        {log.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      <div className="flex items-center gap-1.5">
                        <User size={13} className="text-gray-400" />
                        <span>{log.performedBy}</span>
                        <span className="text-[10px] bg-gold/10 text-gold-dark px-1.5 py-0.2 rounded font-semibold uppercase">
                          {log.role}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-md truncate">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
