import React from 'react';

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
}

/**
 * Generic Reusable DataTable Component (IA2 Exam Requirement Q2)
 * Usable for Book, Member, and BorrowRecord entities with full type safety.
 */
export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No records found'
}: DataTableProps<T>): React.ReactElement {
  if (isLoading) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center text-slate-500">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-medium">Loading data...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <p className="text-sm font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
      <table className="w-full text-left text-sm text-slate-700">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600 border-b border-slate-200">
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                scope="col"
                className={`px-5 py-3.5 ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              className="hover:bg-slate-50/75 transition-colors"
            >
              {columns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  className={`px-5 py-3.5 align-middle ${col.className || ''}`}
                >
                  {col.render
                    ? col.render(item)
                    : col.accessor
                    ? String(item[col.accessor] ?? '')
                    : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
