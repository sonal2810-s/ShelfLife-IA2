import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMemberHistory } from '../api/members';
import { returnBook } from '../api/borrow';
import type { BorrowRecord, Member, Book } from '../types';
import { formatDate, isOverdue } from '../utils/formatters';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  RotateCcw,
  BookOpen,
  User,
  Mail,
  BadgeAlert,
  AlertCircle
} from 'lucide-react';

export const MemberHistory: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [member, setMember] = useState<Member | null>(null);
  const [history, setHistory] = useState<BorrowRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [returningId, setReturningId] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await getMemberHistory(id);
      if (res.success) {
        setMember(res.member);
        setHistory(res.data);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to load member borrow history.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleReturn = async (borrowId: string, bookTitle: string) => {
    setReturningId(borrowId);
    setActionMessage(null);
    try {
      const res = await returnBook(borrowId);
      if (res.success) {
        setActionMessage({
          type: 'success',
          text: `"${bookTitle}" has been returned successfully.`
        });
        fetchHistory();
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to process book return.';
      setActionMessage({
        type: 'error',
        text: msg
      });
    } finally {
      setReturningId(null);
    }
  };

  const overdueCount = history.filter((r) => isOverdue(r.dueDate, r.returnDate, r.status)).length;
  const activeCount = history.filter((r) => !r.returnDate).length;

  return (
    <div className="space-y-6">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/members"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg border border-slate-200 transition-colors"
            title="Back to Members List"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Member Borrowing History
            </h1>
            <p className="text-sm text-slate-500">
              Complete historical and active loan ledger for student / faculty member.
            </p>
          </div>
        </div>

        <Link
          to="/issue"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-xs transition-colors"
        >
          <span>Issue Another Book</span>
        </Link>
      </div>

      {/* Member Details Summary Card */}
      {member && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
              {member.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{member.name}</h2>
                <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">
                  {member.membershipId}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {member.email}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Joined {formatDate(member.joinedDate)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <div className="text-xs text-slate-500 font-medium">Active Loans</div>
              <div className="text-sm font-bold text-slate-800">{activeCount}</div>
            </div>
            <div
              className={`px-3.5 py-1.5 rounded-lg border text-center ${
                overdueCount > 0
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              <div className="text-xs font-medium">Overdue Loans</div>
              <div className="text-sm font-bold">{overdueCount}</div>
            </div>
          </div>
        </div>
      )}

      {/* Action Notification */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-sm animate-fade-in ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Borrow History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-medium">Loading member loan records...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-slate-50">
            <BookOpen className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-medium">No borrowing records on file for this member.</p>
            <p className="text-xs text-slate-400 mt-1">Issue a book to create the first record.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Book Details</th>
                  <th className="px-5 py-3.5">Issue Date</th>
                  <th className="px-5 py-3.5">Due Date</th>
                  <th className="px-5 py-3.5">Return Date</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((record) => {
                  const book = typeof record.book === 'object' ? (record.book as Book) : null;
                  const itemIsOverdue = isOverdue(record.dueDate, record.returnDate, record.status);
                  const isReturned = record.status === 'returned' || !!record.returnDate;

                  return (
                    <tr
                      key={record._id}
                      className={`hover:bg-slate-50/75 transition-colors ${
                        itemIsOverdue ? 'bg-rose-50/40' : ''
                      }`}
                    >
                      {/* Book Details */}
                      <td className="px-5 py-3.5 align-middle">
                        <div className="font-semibold text-slate-900">
                          {book ? book.title : 'Book ID: ' + String(record.book)}
                        </div>
                        {book && (
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{book.author}</span>
                            <span>&bull;</span>
                            <span className="font-mono">{book.ISBN}</span>
                          </div>
                        )}
                      </td>

                      {/* Issue Date */}
                      <td className="px-5 py-3.5 align-middle text-slate-600">
                        {formatDate(record.issueDate)}
                      </td>

                      {/* Due Date */}
                      <td className="px-5 py-3.5 align-middle">
                        <span
                          className={
                            itemIsOverdue ? 'font-semibold text-rose-700' : 'text-slate-600'
                          }
                        >
                          {formatDate(record.dueDate)}
                        </span>
                      </td>

                      {/* Return Date */}
                      <td className="px-5 py-3.5 align-middle text-slate-600">
                        {record.returnDate ? (
                          <span className="text-emerald-700 font-medium">
                            {formatDate(record.returnDate)}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Not returned</span>
                        )}
                      </td>

                      {/* Status with VISUALLY DISTINCT OVERDUE BADGE */}
                      <td className="px-5 py-3.5 align-middle text-center">
                        {itemIsOverdue ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-rose-600 text-white shadow-xs animate-pulse">
                            <BadgeAlert className="w-3.5 h-3.5" />
                            OVERDUE
                          </span>
                        ) : isReturned ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Returned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3.5 h-3.5" />
                            Issued
                          </span>
                        )}
                      </td>

                      {/* Action Button: Return Book */}
                      <td className="px-5 py-3.5 align-middle text-right">
                        {!isReturned ? (
                          <button
                            onClick={() => handleReturn(record._id, book?.title || 'Book')}
                            disabled={returningId === record._id}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition-colors ${
                              itemIsOverdue
                                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                : 'bg-slate-800 hover:bg-slate-900 text-white'
                            } disabled:opacity-50`}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>
                              {returningId === record._id ? 'Processing...' : 'Return Book'}
                            </span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Closed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
