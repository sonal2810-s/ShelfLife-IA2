/**
 * Format ISO date string into readable format (e.g. Oct 12, 2026)
 */
export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  } catch {
    return '—';
  }
};

/**
 * Check if a borrow record is currently overdue
 */
export const isOverdue = (dueDate: string, returnDate?: string | null, status?: string): boolean => {
  if (status === 'returned' || returnDate) return false;
  if (status === 'overdue') return true;
  const due = new Date(dueDate).getTime();
  const now = Date.now();
  return due < now;
};
