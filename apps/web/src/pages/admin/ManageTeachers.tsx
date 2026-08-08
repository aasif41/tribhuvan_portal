import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import api from '../../services/api';

import { TableSkeleton } from '../../components/ui/Skeleton';

export function ManageTeachers() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/teachers');
      setTeachers(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch teachers', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string, name: string) => {
    if (confirm(`Are you sure you want to completely delete ${name}? This action cannot be undone and will delete all their related records (subjects, timetable slots, attendance).`)) {
      try {
        await api.delete(`/users/teachers/${userId}`);
        setTeachers(prev => prev.filter(t => t.id !== userId));
        alert('Teacher deleted successfully');
      } catch (error) {
        console.error('Error deleting teacher', error);
        alert('Failed to delete teacher');
      }
    }
  };

  const filteredTeachers = teachers.filter(teacher => 
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (teacher.teacher?.employeeId && teacher.teacher.employeeId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="Manage Teachers" subtitle="View and manage all faculty members" />
      </div>

      <Card>
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <input
            type="text"
            placeholder="Search by name, email or employee ID..."
            className="input-field w-full max-w-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="text-xs sm:text-sm text-brand-muted shrink-0">
            Total Teachers: <span className="font-bold text-navy">{teachers.length}</span>
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : (
          <div className="w-full overflow-x-auto rounded-xl border border-gray-100 shadow-2xs">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 text-brand-muted text-sm uppercase tracking-wider border-b border-brand-border">
                  <th className="p-4 font-semibold">Teacher</th>
                  <th className="p-4 font-semibold">Employee ID</th>
                  <th className="p-4 font-semibold">Department</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {filteredTeachers.map((user: any) => (
                  <tr key={user.id} className="hover:bg-brand-bg/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-navy/10 rounded-full flex items-center justify-center text-navy font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-navy">{user.name}</p>
                          <p className="text-xs text-brand-muted">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-gray-700">
                      {user.teacher?.employeeId || <span className="text-gray-400 italic">Not set</span>}
                    </td>
                    <td className="p-4 text-gray-600">
                      {user.teacher?.department || '-'}
                    </td>
                    <td className="p-4">
                      <Badge variant={user.status === 'APPROVED' ? 'success' : user.status === 'PENDING' ? 'warning' : 'error'}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDelete(user.id, user.name)} 
                        className="text-red-600 hover:text-red-800 hover:underline text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredTeachers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      No teachers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
