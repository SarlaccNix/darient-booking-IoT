import type { Booking } from '@/types';
import { DeleteBookingButton } from './DeleteBookingButton';

interface BookingRowProps {
  booking: Booking;
  onDeleted: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function BookingRow({ booking, onDeleted }: BookingRowProps) {
  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-sm text-gray-900">{booking.space?.name ?? booking.spaceId}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{booking.site?.name ?? booking.siteId}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{booking.clientEmail}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(booking.bookingDate)}</td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
      </td>
      <td className="px-4 py-3 text-right">
        <DeleteBookingButton bookingId={booking.id} onDeleted={onDeleted} />
      </td>
    </tr>
  );
}
