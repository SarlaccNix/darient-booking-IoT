'use client';

import { useState } from 'react';
import { bookingsApi } from '@/lib/api/bookings';

interface DeleteBookingButtonProps {
  bookingId: string;
  onDeleted: () => void;
}

export function DeleteBookingButton({ bookingId, onDeleted }: DeleteBookingButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await bookingsApi.delete(bookingId);
      onDeleted();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete booking');
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
        >
          {loading ? 'Deleting…' : 'Confirm'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
    >
      Delete
    </button>
  );
}
