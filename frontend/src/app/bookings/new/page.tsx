import Link from 'next/link';
import { BookingScene } from '@/components/BookingScene';

export const metadata = { title: 'New Booking — Workspace Booking' };

export default function NewBookingPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/bookings" className="text-sm text-indigo-600 hover:text-indigo-800">
        ← Back to bookings
      </Link>

      <h1 className="mt-6 text-xl font-bold text-gray-900 mb-6">New booking</h1>

      <BookingScene />
    </main>
  );
}
