import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBooks } from '../api/books';
import { getMembers } from '../api/members';
import { issueBook } from '../api/borrow';
import type { Book, Member } from '../types';
import { ArrowUpRight, CheckCircle2, AlertCircle, BookOpen, User, Calendar, ShieldAlert } from 'lucide-react';

export const IssueBook: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');

  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      setErrorMessage(null);
      try {
        const [booksRes, membersRes] = await Promise.all([
          getBooks({ limit: 100 }), // retrieve catalog for selector
          getMembers()
        ]);

        if (booksRes.success) setBooks(booksRes.data);
        if (membersRes.success) setMembers(membersRes.data);
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to load books and members. Please check backend connection.';
        setErrorMessage(msg);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId || !selectedMemberId) {
      setErrorMessage('Please select both a valid member and a book.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await issueBook({
        bookId: selectedBookId,
        memberId: selectedMemberId
      });

      if (res.success) {
        const bookObj = books.find((b) => b._id === selectedBookId);
        const memberObj = members.find((m) => m._id === selectedMemberId);

        setSuccessMessage(
          `Success! "${bookObj?.title || 'Book'}" was issued to ${memberObj?.name || 'Member'}. Standard 14-day due date applied.`
        );

        // Update local availableCopies count in state
        setBooks((prev) =>
          prev.map((b) =>
            b._id === selectedBookId
              ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1) }
              : b
          )
        );

        // Reset selector
        setSelectedBookId('');
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to issue book. The requested book may be out of stock.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedBook = books.find((b) => b._id === selectedBookId);
  const selectedMember = members.find((m) => m._id === selectedMemberId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Issue Book to Member</h1>
        <p className="text-sm text-slate-500">
          Record a loan by selecting an enrolled member and an available catalog book.
        </p>
      </div>

      {/* Success Banner / Toast */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start justify-between text-emerald-800 text-sm animate-fade-in">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900">Book Issued Successfully</p>
              <p className="text-emerald-700 mt-0.5">{successMessage}</p>
            </div>
          </div>
          {selectedMemberId && (
            <button
              onClick={() => navigate(`/members/${selectedMemberId}/history`)}
              className="text-xs font-semibold underline text-emerald-900 hover:text-emerald-700 whitespace-nowrap ml-4"
            >
              View Loan History &rarr;
            </button>
          )}
        </div>
      )}

      {/* Error Banner / Toast */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 text-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">Issue Operation Failed</p>
            <p className="text-red-700 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Issue Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
        {isLoadingData ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-medium">Loading catalog and members directory...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Member Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-600" />
                Select Member *
              </label>
              <select
                required
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                <option value="">-- Choose registered member --</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} — {m.membershipId} ({m.email})
                  </option>
                ))}
              </select>

              {selectedMember && (
                <div className="mt-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 flex items-center justify-between">
                  <span>
                    Selected: <strong>{selectedMember.name}</strong> ({selectedMember.membershipId})
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(`/members/${selectedMember._id}/history`)}
                    className="text-indigo-600 hover:underline font-semibold"
                  >
                    Check current loans
                  </button>
                </div>
              )}
            </div>

            {/* Book Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Select Book *
              </label>
              <select
                required
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                <option value="">-- Choose book to issue --</option>
                {books.map((b) => (
                  <option
                    key={b._id}
                    value={b._id}
                    disabled={b.availableCopies <= 0}
                  >
                    {b.title} &mdash; {b.author} [{b.genre}] (Available:{' '}
                    {b.availableCopies}/{b.totalCopies})
                  </option>
                ))}
              </select>

              {selectedBook && (
                <div className="mt-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 flex items-center justify-between">
                  <span>
                    Available Inventory:{' '}
                    <strong
                      className={
                        selectedBook.availableCopies > 0 ? 'text-emerald-600' : 'text-red-600'
                      }
                    >
                      {selectedBook.availableCopies} of {selectedBook.totalCopies} copies in stock
                    </strong>
                  </span>
                  <span className="font-mono text-slate-500">ISBN: {selectedBook.ISBN}</span>
                </div>
              )}
            </div>

            {/* Loan Duration Notice */}
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center gap-3 text-xs text-indigo-900">
              <Calendar className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span>
                Standard borrowing policy: Books are issued for a fixed duration of <strong>14 calendar days</strong>.
              </span>
            </div>

            {/* Concurrency Safe Notice */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-xs text-slate-500">
              <ShieldAlert className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>
                Protected against race conditions: The backend executes an atomic conditional inventory decrement.
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !selectedBookId || !selectedMemberId || (selectedBook?.availableCopies ?? 0) <= 0}
                className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Issue Request...</span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Confirm &amp; Issue Book</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
