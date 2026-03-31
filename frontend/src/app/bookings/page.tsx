import Link from 'next/link';
import { BookingTable } from '@/components/BookingTable';

export const metadata = { title: 'Bookings — Workspace Booking' };

export default function BookingsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="mt-1 text-sm text-gray-500">All workspace reservations.</p>
        </div>
        <Link
          href="/bookings/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          New booking
        </Link>
      </div>
      <BookingTable />
    </main>
  );
}
