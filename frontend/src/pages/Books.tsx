import React, { useState, useEffect, useCallback } from 'react';
import { getBooks, createBook } from '../api/books';
import type { Book, CreateBookPayload } from '../types';
import { DataTable, type Column } from '../components/DataTable';
import { Search, Plus, Filter, AlertCircle, RefreshCw, X, CheckCircle2 } from 'lucide-react';

const GENRES = [
  'All Genres',
  'Fiction',
  'Computer Science',
  'Science',
  'History',
  'Philosophy'
];

export const Books: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters & Pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1
  });

  // Add Book modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [newBook, setNewBook] = useState<CreateBookPayload>({
    title: '',
    author: '',
    ISBN: '',
    genre: 'Computer Science',
    totalCopies: 3,
    availableCopies: 3
  });

  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getBooks({
        page: currentPage,
        limit: pageSize,
        genre: selectedGenre === 'All Genres' ? undefined : selectedGenre,
        search: searchTerm.trim() || undefined
      });

      if (res.success) {
        setBooks(res.data);
        if (res.pagination) {
          setPagination({
            total: res.pagination.total,
            totalPages: res.pagination.totalPages
          });
        }
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to fetch books. Please check server connection.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, selectedGenre, searchTerm]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError(null);

    try {
      const res = await createBook({
        ...newBook,
        totalCopies: Number(newBook.totalCopies),
        availableCopies: Number(newBook.availableCopies ?? newBook.totalCopies)
      });

      if (res.success) {
        setSuccessMessage(`"${res.data.title}" added to catalog.`);
        setIsModalOpen(false);
        setNewBook({
          title: '',
          author: '',
          ISBN: '',
          genre: 'Computer Science',
          totalCopies: 3,
          availableCopies: 3
        });
        fetchBooks();
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to add book. Please verify inputs.';
      setModalError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Book>[] = [
    {
      header: 'Title & Author',
      render: (book) => (
        <div>
          <div className="font-semibold text-slate-900">{book.title}</div>
          <div className="text-xs text-slate-500">by {book.author}</div>
        </div>
      )
    },
    {
      header: 'ISBN',
      render: (book) => (
        <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-700">
          {book.ISBN}
        </code>
      )
    },
    {
      header: 'Genre',
      render: (book) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
          {book.genre}
        </span>
      )
    },
    {
      header: 'Total Copies',
      accessor: 'totalCopies',
      className: 'text-center'
    },
    {
      header: 'Available Copies',
      className: 'text-center',
      render: (book) => (
        <div className="flex flex-col items-center">
          <span className="font-semibold text-sm">
            {book.availableCopies} / {book.totalCopies}
          </span>
          <span
            className={`inline-block w-2.5 h-2.5 rounded-full mt-1 ${
              book.availableCopies > 0 ? 'bg-emerald-500' : 'bg-red-500'
            }`}
            title={book.availableCopies > 0 ? 'In Stock' : 'Out of Stock'}
          />
        </div>
      )
    },
    {
      header: 'Status',
      className: 'text-right',
      render: (book) =>
        book.availableCopies > 0 ? (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Available
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            Unavailable
          </span>
        )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Book Catalog</h1>
          <p className="text-sm text-slate-500">
            Browse collection, manage copies, and monitor availability across campuses.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Book</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error State Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-red-700 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchBooks}
            className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-red-700 hover:underline"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center gap-4">
        {/* Title Search */}
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search books by title..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* Genre Dropdown Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={selectedGenre}
            onChange={(e) => {
              setSelectedGenre(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-48 py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
          >
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Generic DataTable Component (IA2 Requirement) */}
      <DataTable<Book>
        data={books}
        columns={columns}
        keyExtractor={(book) => book._id}
        isLoading={isLoading}
        emptyMessage="No books matched the search or filter criteria."
      />

      {/* Pagination Controls */}
      {!isLoading && books.length > 0 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-sm text-slate-600">
          <div>
            Showing <span className="font-semibold text-slate-800">{books.length}</span> of{' '}
            <span className="font-semibold text-slate-800">{pagination.total}</span> books
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-xs text-slate-600 font-medium px-2">
              Page {currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={currentPage >= pagination.totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Add New Book to Catalog</h2>
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

            <form onSubmit={handleCreateBook} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Book Title *
                </label>
                <input
                  type="text"
                  required
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  placeholder="e.g. Modern Operating Systems"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Author *
                </label>
                <input
                  type="text"
                  required
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  placeholder="e.g. Andrew S. Tanenbaum"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ISBN *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBook.ISBN}
                    onChange={(e) => setNewBook({ ...newBook, ISBN: e.target.value })}
                    placeholder="e.g. 978-0133591620"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Genre *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBook.genre}
                    onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })}
                    placeholder="e.g. Computer Science"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Copies *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newBook.totalCopies}
                    onChange={(e) => {
                      const total = parseInt(e.target.value, 10) || 1;
                      setNewBook({
                        ...newBook,
                        totalCopies: total,
                        availableCopies: total
                      });
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Available Copies *
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={newBook.totalCopies}
                    required
                    value={newBook.availableCopies}
                    onChange={(e) =>
                      setNewBook({
                        ...newBook,
                        availableCopies: parseInt(e.target.value, 10) || 0
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
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
                  {isSubmitting ? 'Adding...' : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
