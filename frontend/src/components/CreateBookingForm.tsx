'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { bookingsApi } from '@/lib/api/bookings';
import { spacesApi } from '@/lib/api/spaces';
import { ApiError } from '@/lib/api/client';
import type { Space } from '@/types';

// ── Time slot helpers ──────────────────────────────────────────────────────────
function buildSlots(fromH: number, fromM: number, toH: number, toM: number): string[] {
  const slots: string[] = [];
  let h = fromH, m = fromM;
  while (h < toH || (h === toH && m <= toM)) {
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    m += 30;
    if (m >= 60) { h++; m -= 60; }
  }
  return slots;
}

function formatSlot(slot: string): string {
  const [h, m] = slot.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${String(m).padStart(2, '0')} ${ampm}`;
}

// 06:00–18:30 for start (latest start allows a 18:30–19:00 booking)
const START_SLOTS = buildSlots(6, 0, 18, 30);
// 06:30–19:00 for end
const END_SLOTS = buildSlots(6, 30, 19, 0);

function getApiErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.statusCode === 409) return 'This space is already booked for the selected time.';
    if (err.statusCode === 422) return 'You have reached the 3 booking limit for this week.';
    return err.message;
  }
  return 'An unexpected error occurred. Please try again.';
}

interface CreateBookingFormProps {
  /** When set by a parent (e.g. 3D scene selector), syncs spaceId into the form. */
  externalSpaceId?: string;
  /** Called whenever the booking date changes — lets a parent drive availability coloring. */
  onBookingDateChange?: (date: string) => void;
}

export function CreateBookingForm({
  externalSpaceId,
  onBookingDateChange,
}: CreateBookingFormProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultSpaceId = searchParams.get('spaceId') ?? '';

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [spaceId, setSpaceId] = useState(defaultSpaceId);
  const [clientEmail, setClientEmail] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    spacesApi.getAll().then(setSpaces).catch(() => {});
  }, []);

  // Sync spaceId when the 3D scene selector picks a space
  useEffect(() => {
    if (externalSpaceId) setSpaceId(externalSpaceId);
  }, [externalSpaceId]);

  // Notify parent when booking date changes (for scene availability coloring)
  useEffect(() => {
    onBookingDateChange?.(bookingDate);
  }, [bookingDate, onBookingDateChange]);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!spaceId) errors.spaceId = 'Please select a space.';
    if (!clientEmail) errors.clientEmail = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail))
      errors.clientEmail = 'Please enter a valid email address.';
    if (!bookingDate) errors.bookingDate = 'Booking date is required.';
    else if (new Date(bookingDate) < new Date(new Date().toDateString()))
      errors.bookingDate = 'Booking date must be today or in the future.';
    if (!startTime) errors.startTime = 'Start time is required.';
    if (!endTime) errors.endTime = 'End time is required.';
    if (startTime && endTime && startTime >= endTime)
      errors.endTime = 'End time must be after start time.';
    return errors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      await bookingsApi.create({
        spaceId,
        clientEmail,
        bookingDate: new Date(bookingDate).toISOString(),
        startTime: new Date(`${bookingDate}T${startTime}`).toISOString(),
        endTime: new Date(`${bookingDate}T${endTime}`).toISOString(),
      });
      router.push('/bookings');
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {apiError && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{apiError}</p>
        </div>
      )}

      <div>
        <label htmlFor="spaceId" className="block text-sm font-medium text-gray-700">
          Space
        </label>
        <select
          id="spaceId"
          value={spaceId}
          onChange={(e) => setSpaceId(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Select a space…</option>
          {spaces.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {s.site?.name ?? ''} (cap. {s.capacity})
            </option>
          ))}
        </select>
        {fieldErrors.spaceId && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.spaceId}</p>
        )}
      </div>

      <div>
        <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700">
          Your email
        </label>
        <input
          id="clientEmail"
          type="email"
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {fieldErrors.clientEmail && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.clientEmail}</p>
        )}
      </div>

      <div>
        <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700">
          Date
        </label>
        <input
          id="bookingDate"
          type="date"
          value={bookingDate}
          onChange={(e) => setBookingDate(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {fieldErrors.bookingDate && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.bookingDate}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
            Start time
          </label>
          <select
            id="startTime"
            value={startTime}
            onChange={(e) => {
              const value = e.target.value;
              setStartTime(value);
              // Clear end time if it's no longer after the new start time
              if (endTime && endTime <= value) setEndTime('');
            }}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Select…</option>
            {START_SLOTS.map((t) => (
              <option key={t} value={t}>{formatSlot(t)}</option>
            ))}
          </select>
          {fieldErrors.startTime && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.startTime}</p>
          )}
        </div>
        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
            End time
          </label>
          <select
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Select…</option>
            {END_SLOTS.filter((t) => t > startTime).map((t) => (
              <option key={t} value={t}>{formatSlot(t)}</option>
            ))}
          </select>
          {fieldErrors.endTime && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.endTime}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? 'Creating booking…' : 'Create booking'}
      </button>
    </form>
  );
}
