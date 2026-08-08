import { useState, useMemo } from 'react';
import { useAttendance } from '../../hooks/useAttendance';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { AttendanceBar } from '../../components/shared/AttendanceBar';
import { Badge } from '../../components/ui/Badge';
import { Calendar, Filter, Clock, Users, BookOpen } from 'lucide-react';

import { PageSkeleton } from '../../components/ui/Skeleton';

export function Attendance() {
  const { attendance, loading } = useAttendance();
  const [activeTab, setActiveTab] = useState<'summary' | 'history'>('summary');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const overallAttendance =
    attendance.length > 0
      ? Math.round(attendance.reduce((sum, a) => sum + a.percentage, 0) / attendance.length)
      : 0;

  // Flatten and format all individual records from the subject summaries
  const allRecords = useMemo(() => {
    return attendance
      .flatMap((subjectSummary) => {
        const subjectRecords = subjectSummary.records || [];
        return subjectRecords.map((record) => ({
          ...record,
          subjectName: subjectSummary.subjectName,
          subjectCode: subjectSummary.subjectCode,
        }));
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [attendance]);

  // Filter records based on selected filters
  const filteredRecords = useMemo(() => {
    return allRecords.filter((record) => {
      const matchSubject = !selectedSubjectId || record.subjectId === selectedSubjectId;
      const matchStatus = !selectedStatus || record.status === selectedStatus;
      return matchSubject && matchStatus;
    });
  }, [allRecords, selectedSubjectId, selectedStatus]);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'success';
      case 'LATE':
        return 'warning';
      case 'ABSENT':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" subtitle="Track your attendance across all subjects" />

      {/* Overall stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card hover>
          <div className="flex items-center justify-between">
            <p className="text-sm text-brand-muted">Overall Attendance</p>
            <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center text-gold">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-4xl font-bold text-brand-text mt-2">{overallAttendance}%</p>
          <AttendanceBar percentage={overallAttendance} height="md" showText={false} />
        </Card>
        <Card hover>
          <div className="flex items-center justify-between">
            <p className="text-sm text-brand-muted">Subjects Below 75%</p>
            <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center text-red-500">
              <BookOpen size={16} />
            </div>
          </div>
          <p className="text-4xl font-bold text-red-500 mt-2">
            {attendance.filter((a) => a.percentage < 75).length}
          </p>
          <p className="text-xs text-brand-muted mt-2">Minimum 75% required</p>
        </Card>
        <Card hover>
          <div className="flex items-center justify-between">
            <p className="text-sm text-brand-muted">Total Classes Attended</p>
            <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center text-green-600">
              <Users size={16} />
            </div>
          </div>
          <p className="text-4xl font-bold text-brand-text mt-2">
            {attendance.reduce((sum, a) => sum + a.present + a.late, 0)}
          </p>
          <p className="text-xs text-brand-muted mt-2">
            out of {attendance.reduce((sum, a) => sum + a.totalClasses, 0)}
          </p>
        </Card>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('summary')}
          className={`py-3 px-6 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
            activeTab === 'summary'
              ? 'border-gold text-brand-text'
              : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          Subject-wise Summary
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`py-3 px-6 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
            activeTab === 'history'
              ? 'border-gold text-brand-text'
              : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          Daily Attendance History
        </button>
      </div>

      {/* Per-subject breakdown tab */}
      {activeTab === 'summary' && (
        <Card>
          <CardHeader title="Subject-wise Attendance" />
          <div className="space-y-6">
            {attendance.map((att) => (
              <div key={att.subjectId} className="pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-brand-text">{att.subjectName}</h4>
                    <p className="text-xs text-brand-muted">{att.subjectCode}</p>
                  </div>
                  <Badge variant={att.percentage >= 75 ? 'success' : att.percentage >= 60 ? 'warning' : 'error'}>
                    {att.percentage}%
                  </Badge>
                </div>
                <AttendanceBar percentage={att.percentage} height="sm" showText={false} />
                <div className="flex gap-4 mt-2 text-xs text-brand-muted">
                  <span>Present: {att.present}</span>
                  <span>Late: {att.late}</span>
                  <span>Absent: {att.absent}</span>
                  <span>Total: {att.totalClasses}</span>
                </div>
              </div>
            ))}
            {attendance.length === 0 && (
              <p className="text-sm text-brand-muted text-center py-8">No attendance records yet</p>
            )}
          </div>
        </Card>
      )}

      {/* Daily Attendance History tab */}
      {activeTab === 'history' && (
        <Card>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-semibold text-brand-text flex items-center gap-2">
                <Calendar size={18} className="text-gold" />
                Daily Attendance History
              </h3>
              <p className="text-sm text-brand-muted mt-0.5">View your day-to-day class attendance records</p>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-brand-muted" />
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="text-xs bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gold/50"
                >
                  <option value="">All Subjects</option>
                  {attendance.map((att) => (
                    <option key={att.subjectId} value={att.subjectId}>
                      {att.subjectCode}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-xs bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gold/50"
              >
                <option value="">All Statuses</option>
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LATE">Late</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold text-brand-muted uppercase tracking-wider">
                    <th className="pb-3 pt-2 pl-4">Date</th>
                    <th className="pb-3 pt-2">Subject</th>
                    <th className="pb-3 pt-2">Status</th>
                    <th className="pb-3 pt-2 pr-4">Marked By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="text-sm hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 pl-4 font-medium text-brand-text">
                        {formatDate(record.date)}
                      </td>
                      <td className="py-4">
                        <div className="font-medium text-brand-text">{record.subjectName}</div>
                        <div className="text-xs text-brand-muted">{record.subjectCode}</div>
                      </td>
                      <td className="py-4">
                        <Badge variant={getStatusVariant(record.status)}>
                          {record.status}
                        </Badge>
                      </td>
                      <td className="py-4 text-brand-muted pr-4">
                        {record.teacher?.user?.name || 'System / Auto'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile List View */}
            <div className="md:hidden space-y-4">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="p-4 rounded-lg border border-gray-100 space-y-3 bg-white hover:border-gold/30 transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-brand-muted font-medium">{formatDate(record.date)}</p>
                      <h4 className="font-medium text-brand-text mt-1">{record.subjectName}</h4>
                      <p className="text-xs text-brand-muted">{record.subjectCode}</p>
                    </div>
                    <Badge variant={getStatusVariant(record.status)}>
                      {record.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-50 text-brand-muted">
                    <span>Marked by:</span>
                    <span className="font-medium text-brand-text">{record.teacher?.user?.name || 'System / Auto'}</span>
                  </div>
                </div>
              ))}
            </div>

            {filteredRecords.length === 0 && (
              <p className="text-sm text-brand-muted text-center py-12">No attendance records match your filter criteria.</p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
