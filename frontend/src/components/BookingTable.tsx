'use client';

import { useState } from 'react';
import { useBookings } from '@/hooks/useBookings';
import { BookingRow } from './BookingRow';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export function BookingTable() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { result, loading, error, errorCode, refetch } = useBookings({ page, pageSize });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} statusCode={errorCode} />;
  if (!result || result.data.length === 0)
    return <p className="text-center text-gray-500 py-12">No bookings found.</p>;

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Space</th>
              <th className="px-4 py-3">Site</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {result.data.map((booking) => (
              <BookingRow key={booking.id} booking={booking} onDeleted={refetch} />
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={result.meta.page}
        totalPages={result.meta.totalPages}
        onPageChange={setPage}
      />

      <p className="mt-2 text-center text-xs text-gray-400">
        {result.meta.total} total booking{result.meta.total !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
