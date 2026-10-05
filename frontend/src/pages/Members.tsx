import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getMembers, createMember } from '../api/members';
import type { Member, CreateMemberPayload } from '../types';
import { DataTable, type Column } from '../components/DataTable';
import { formatDate } from '../utils/formatters';
import { Plus, Search, CheckCircle2, AlertCircle, History, X } from 'lucide-react';

export const Members: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [newMember, setNewMember] = useState<CreateMemberPayload>({
    name: '',
    email: '',
    membershipId: ''
  });

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getMembers();
      if (res.success) {
        setMembers(res.data);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to fetch members list.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleRegisterMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError(null);

    try {
      const res = await createMember(newMember);
      if (res.success) {
        setSuccessMessage(`Member "${res.data.name}" successfully registered.`);
        setIsModalOpen(false);
        setNewMember({ name: '', email: '', membershipId: '' });
        fetchMembers();
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to register member. Please check details.';
      setModalError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMembers = members.filter((m) => {
    const q = searchTerm.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.membershipId.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q)
    );
  });

  // Columns for generic DataTable<Member> (IA2 Requirement)
  const columns: Column<Member>[] = [
    {
      header: 'Member Name',
      render: (member) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
            {member.name.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-slate-900">{member.name}</div>
            <div className="text-xs text-slate-500 font-mono">{member.membershipId}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Email',
      accessor: 'email',
      className: 'text-slate-600'
    },
    {
      header: 'Joined Date',
      render: (member) => <span>{formatDate(member.joinedDate)}</span>
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (member) => (
        <Link
          to={`/members/${member._id}/history`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-lg text-xs font-semibold border border-slate-200 hover:border-indigo-200 transition-colors"
        >
          <History className="w-3.5 h-3.5" />
          <span>View History</span>
        </Link>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Members Directory</h1>
          <p className="text-sm text-slate-500">
            Registered students and faculty members authorized for library borrowings.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Member</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search members by name, email, or membership ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Reusable Generic DataTable<Member> (IA2 Requirement) */}
      <DataTable<Member>
        data={filteredMembers}
        columns={columns}
        keyExtractor={(m) => m._id}
        isLoading={isLoading}
        emptyMessage="No members found matching your search."
      />

      {/* Register Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Register New Member</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterMember} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="e.g. Vikram Malhotra"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="e.g. vikram.malhotra@college.edu"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Membership ID *
                </label>
                <input
                  type="text"
                  required
                  value={newMember.membershipId}
                  onChange={(e) => setNewMember({ ...newMember, membershipId: e.target.value })}
                  placeholder="e.g. MEM-2026-042"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? 'Registering...' : 'Register Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
