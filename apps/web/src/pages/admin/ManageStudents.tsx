import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import api from '../../services/api';

export function ManageStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/students');
      setStudents(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch students', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string, name: string) => {
    if (confirm(`Are you sure you want to completely delete ${name}? This action cannot be undone and will delete all their related records (enrollments, attendance).`)) {
      try {
        await api.delete(`/users/students/${userId}`);
        setStudents(prev => prev.filter(s => s.id !== userId));
        alert('Student deleted successfully');
      } catch (error) {
        console.error('Error deleting student', error);
        alert('Failed to delete student');
      }
    }
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.student?.rollNo && student.student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="Manage Students" subtitle="View and manage all registered students" />
      </div>

      <Card>
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <input
            type="text"
            placeholder="Search by name, email or roll number..."
            className="input-field w-full max-w-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="text-xs sm:text-sm text-brand-muted shrink-0">
            Total Students: <span className="font-bold text-navy">{students.length}</span>
          </div>
        </div>

        {loading ? (
          <p className="text-center p-8 text-brand-muted">Loading students...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 text-brand-muted text-sm uppercase tracking-wider border-b border-brand-border">
                  <th className="p-4 font-semibold">Student</th>
                  <th className="p-4 font-semibold">Roll No</th>
                  <th className="p-4 font-semibold">Program</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {filteredStudents.map((user: any) => (
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
                      {user.student?.rollNo || <span className="text-gray-400 italic">Not set</span>}
                    </td>
                    <td className="p-4 text-gray-600">
                      {user.student ? `${user.student.program} (Sem ${user.student.semester})` : '-'}
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
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      No students found.
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
