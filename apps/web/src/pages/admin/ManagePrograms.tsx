import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  AlertCircle,
  Building2,
  Clock,
  Layers,
  X,
} from 'lucide-react';
import { UNIVERSITIES } from '@tribhuvan/shared';

export interface Program {
  id: string;
  code: string;
  name: string;
  university: string;
  duration: number;
  semesters: number;
  createdAt?: string;
}

export function ManagePrograms() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Status messages
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [university, setUniversity] = useState<string>(UNIVERSITIES.NALANDA);
  const [duration, setDuration] = useState(3);
  const [semesters, setSemesters] = useState(6);

  // Delete modal state
  const [deletingProgram, setDeletingProgram] = useState<Program | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const res = await api.get('/programs');
      setPrograms(res.data.data || []);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to load programs list');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProgram(null);
    setCode('');
    setName('');
    setUniversity(UNIVERSITIES.NALANDA);
    setDuration(3);
    setSemesters(6);
    setShowModal(true);
    setErrorMsg(null);
  };

  const handleOpenEditModal = (prog: Program) => {
    setEditingProgram(prog);
    setCode(prog.code);
    setName(prog.name);
    setUniversity(prog.university || UNIVERSITIES.NALANDA);
    setDuration(prog.duration || 3);
    setSemesters(prog.semesters || 6);
    setShowModal(true);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      if (editingProgram) {
        // Update existing program
        const res = await api.put(`/programs/${editingProgram.id}`, {
          code,
          name,
          university,
          duration: Number(duration),
          semesters: Number(semesters),
        });
        setSuccessMsg(res.data.message || 'Program updated successfully!');
      } else {
        // Create new program
        const res = await api.post('/programs', {
          code,
          name,
          university,
          duration: Number(duration),
          semesters: Number(semesters),
        });
        setSuccessMsg(res.data.message || 'Program created successfully!');
      }

      setShowModal(false);
      fetchPrograms();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Operation failed. Please check inputs.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProgram) return;
    setDeleteLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await api.delete(`/programs/${deletingProgram.id}`);
      setSuccessMsg(res.data.message || 'Program deleted successfully!');
      setDeletingProgram(null);
      fetchPrograms();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete program');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredPrograms = programs.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.university.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-text flex items-center gap-2.5">
            <BookOpen className="text-navy" size={26} />
            Academic Programs Management
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Add, edit, and delete academic degree programs available for student enrollment.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="btn-primary flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider py-2.5 px-4 rounded-lg shadow-sm"
        >
          <Plus size={16} />
          <span>Add New Program</span>
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900">
            <X size={14} />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-600 hover:text-red-900">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Search & Stats Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search programs by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30"
          />
        </div>

        <div className="text-xs text-brand-muted font-medium">
          Total Programs: <span className="font-bold text-navy">{programs.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-brand-muted text-xs flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-navy border-t-transparent rounded-full animate-spin" />
            <span>Loading academic programs...</span>
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="p-12 text-center text-brand-muted text-xs">
            No academic programs found. Click "Add New Program" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-brand-muted uppercase tracking-wider">
                  <th className="py-3.5 px-5">Program Name</th>
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Affiliated University</th>
                  <th className="py-3.5 px-4 text-center">Duration</th>
                  <th className="py-3.5 px-4 text-center">Semesters</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-brand-text">
                {filteredPrograms.map((prog) => (
                  <tr key={prog.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-navy">
                      <div className="flex items-center gap-2">
                        <BookOpen size={16} className="text-gold shrink-0" />
                        <span>{prog.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-navy/5 text-navy border border-navy/10 rounded-md font-mono text-[11px] font-bold">
                        {prog.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-brand-muted">
                      <div className="flex items-center gap-1.5">
                        <Building2 size={14} className="text-gray-400 shrink-0" />
                        <span>{prog.university}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1 text-gray-600 font-medium">
                        <Clock size={13} className="text-gray-400" />
                        <span>{prog.duration} Years</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1 text-gray-600 font-medium">
                        <Layers size={13} className="text-gray-400" />
                        <span>{prog.semesters} Sem</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(prog)}
                          className="p-1.5 text-slate-600 hover:text-navy hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit Program"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeletingProgram(prog)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Program"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ADD / EDIT PROGRAM MODAL                                                 */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-lg w-full overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
                <BookOpen size={18} className="text-gold" />
                {editingProgram ? 'Edit Academic Program' : 'Add New Academic Program'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-brand-text mb-1">
                  Program Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Tech Computer Science & Engineering"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-brand-text mb-1">
                    Program Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BTECH-CSE"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="input-field uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-brand-text mb-1">
                    Affiliated University *
                  </label>
                  <select
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="input-field"
                  >
                    <option value={UNIVERSITIES.NALANDA}>{UNIVERSITIES.NALANDA}</option>
                    <option value={UNIVERSITIES.GGSIP}>{UNIVERSITIES.GGSIP}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-brand-text mb-1">
                    Duration (Years) *
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => {
                      const d = Number(e.target.value);
                      setDuration(d);
                      setSemesters(d * 2);
                    }}
                    className="input-field"
                  >
                    <option value={1}>1 Year</option>
                    <option value={2}>2 Years</option>
                    <option value={3}>3 Years</option>
                    <option value={4}>4 Years</option>
                    <option value={5}>5 Years</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-brand-text mb-1">
                    Total Semesters *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    required
                    value={semesters}
                    onChange={(e) => setSemesters(Number(e.target.value))}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-brand-text font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="btn-primary px-5 py-2 text-xs font-semibold uppercase tracking-wider disabled:opacity-50"
                >
                  {formLoading ? 'Saving...' : editingProgram ? 'Update Program' : 'Create Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL                                                */}
      {/* ========================================================================= */}
      {deletingProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-base font-bold text-brand-text mb-1">Confirm Program Deletion</h3>
            <p className="text-xs text-brand-muted mb-6">
              Are you sure you want to delete <span className="font-bold text-navy">"{deletingProgram.name}"</span> ({deletingProgram.code})?
              This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingProgram(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-xs font-medium text-brand-text hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
