import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import api from '../../services/api';
import { PROGRAM_NAMES } from '@tribhuvan/shared';

import { TableSkeleton } from '../../components/ui/Skeleton';

export function ManageSubjects() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [program, setProgram] = useState(PROGRAM_NAMES[0]);
  const [semester, setSemester] = useState('6');
  const [credits, setCredits] = useState('4');
  const [teacherId, setTeacherId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subRes, metaRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/timetable/metadata')
      ]);
      setSubjects(subRes.data.data || []);
      setTeachers(metaRes.data.data.teachers || []);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        code,
        name,
        program,
        semester: Number(semester),
        credits: Number(credits),
        teacherId: teacherId || null
      };

      if (editingId) {
        await api.put(`/subjects/${editingId}`, payload);
        alert('Subject updated');
      } else {
        await api.post('/subjects', payload);
        alert('Subject created');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error saving subject', error);
      alert(error.response?.data?.message || 'Failed to save subject');
    }
  };

  const handleEdit = (subject: any) => {
    setEditingId(subject.id);
    setCode(subject.code);
    setName(subject.name);
    setProgram(subject.program);
    setSemester(subject.semester.toString());
    setCredits(subject.credits.toString());
    setTeacherId(subject.teacherId || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this subject?')) {
      try {
        await api.delete(`/subjects/${id}`);
        fetchData();
      } catch (error: any) {
        console.error('Error deleting', error);
        alert(error.response?.data?.message || 'Failed to delete');
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setCode('');
    setName('');
    setProgram(PROGRAM_NAMES[0]);
    setSemester('6');
    setCredits('4');
    setTeacherId('');
  };

  // Group subjects by program
  const groupedSubjects = subjects.reduce((acc: any, subject: any) => {
    if (!acc[subject.program]) acc[subject.program] = [];
    acc[subject.program].push(subject);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="Manage Subjects" subtitle="Create and manage course subjects" />
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Add Subject
        </button>
      </div>

      <Card>
        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : (
          <div className="space-y-8">
            {Object.keys(groupedSubjects).length === 0 ? (
              <p className="p-8 text-center text-gray-500">No subjects found. Add a subject to get started.</p>
            ) : (
              Object.keys(groupedSubjects).map(prog => (
                <div key={prog} className="border border-brand-border rounded-lg overflow-hidden">
                  <div className="bg-brand-bg px-4 py-3 border-b border-brand-border font-bold text-navy text-lg">
                    {prog}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[550px]">
                      <thead>
                        <tr className="bg-gray-50 text-brand-muted text-sm uppercase tracking-wider border-b border-brand-border">
                          <th className="p-4 font-semibold">Code</th>
                          <th className="p-4 font-semibold">Name</th>
                          <th className="p-4 font-semibold">Sem</th>
                          <th className="p-4 font-semibold">Credits</th>
                          <th className="p-4 font-semibold">Teacher</th>
                          <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border">
                        {groupedSubjects[prog].map((subject: any) => (
                          <tr key={subject.id} className="hover:bg-brand-bg/50 transition-colors">
                            <td className="p-4 font-medium text-navy">{subject.code}</td>
                            <td className="p-4">{subject.name}</td>
                            <td className="p-4">Sem {subject.semester}</td>
                            <td className="p-4">{subject.credits}</td>
                            <td className="p-4">{subject.teacher ? subject.teacher.user.name : <span className="text-gray-400 italic">Not Assigned</span>}</td>
                             <td className="p-4 text-right space-x-3">
                               <button onClick={() => handleEdit(subject)} className="text-blue-600 hover:text-blue-800 p-1" title="Edit">
                                 <Pencil size={18} />
                               </button>
                               <button onClick={() => handleDelete(subject.id)} className="text-red-600 hover:text-red-800 p-1" title="Delete">
                                 <Trash2 size={18} />
                               </button>
                             </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-navy">{editingId ? 'Edit Subject' : 'Add Subject'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label>
                <input required type="text" className="input-field" value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. CS-601" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                <input required type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Artificial Intelligence" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                  <select required className="input-field" value={program} onChange={e => setProgram(e.target.value)}>
                    {PROGRAM_NAMES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                  <input required type="number" className="input-field" value={semester} onChange={e => setSemester(e.target.value)} min="1" max="8" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                  <input required type="number" className="input-field" value={credits} onChange={e => setCredits(e.target.value)} min="1" max="10" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Teacher (Optional)</label>
                  <select className="input-field" value={teacherId} onChange={e => setTeacherId(e.target.value)}>
                    <option value="">-- Not Assigned --</option>
                    {teachers.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.user.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
