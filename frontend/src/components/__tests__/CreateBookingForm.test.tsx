import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateBookingForm } from '../CreateBookingForm';

// Mock Next.js router and searchParams
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(''),
}));

// Mock the spaces API
vi.mock('@/lib/api/spaces', () => ({
  spacesApi: {
    getAll: vi.fn().mockResolvedValue([
      {
        id: 'space_alpha_1',
        name: 'Board Room',
        capacity: 12,
        siteId: 'site_alpha',
        site: { id: 'site_alpha', name: 'Alpha Tower' },
        locationReference: null,
        description: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]),
  },
}));

// Mock the bookings API
vi.mock('@/lib/api/bookings', () => ({
  bookingsApi: {
    create: vi.fn().mockResolvedValue({ id: 'booking_1' }),
  },
}));

describe('CreateBookingForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows validation error when space is not selected', async () => {
    render(<CreateBookingForm />);
    fireEvent.click(screen.getByRole('button', { name: /create booking/i }));
    await waitFor(() => {
      expect(screen.getByText('Please select a space.')).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    render(<CreateBookingForm />);

    await userEvent.type(screen.getByLabelText(/your email/i), 'not-an-email');
    fireEvent.click(screen.getByRole('button', { name: /create booking/i }));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    });
  });

  it('shows validation error when email is empty', async () => {
    render(<CreateBookingForm />);
    fireEvent.click(screen.getByRole('button', { name: /create booking/i }));
    await waitFor(() => {
      expect(screen.getByText('Email is required.')).toBeInTheDocument();
    });
  });

  it('shows validation error when booking date is missing', async () => {
    render(<CreateBookingForm />);
    fireEvent.click(screen.getByRole('button', { name: /create booking/i }));
    await waitFor(() => {
      expect(screen.getByText('Booking date is required.')).toBeInTheDocument();
    });
  });

  it('shows validation error when end time is not selected', async () => {
    render(<CreateBookingForm />);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: dateStr } });
    fireEvent.change(screen.getByLabelText(/start time/i), { target: { value: '14:00' } });
    // end time intentionally left unselected

    fireEvent.click(screen.getByRole('button', { name: /create booking/i }));

    await waitFor(() => {
      expect(screen.getByText('End time is required.')).toBeInTheDocument();
    });
  });

  it('end time dropdown only shows slots after the selected start time', async () => {
    render(<CreateBookingForm />);

    fireEvent.change(screen.getByLabelText(/start time/i), { target: { value: '14:00' } });

    const endSelect = screen.getByLabelText(/end time/i);
    const options = Array.from(endSelect.querySelectorAll('option'))
      .map((o) => (o as HTMLOptionElement).value)
      .filter(Boolean); // exclude the empty placeholder

    // Every option must be strictly after 14:00
    expect(options.every((t) => t > '14:00')).toBe(true);
    // The first available slot should be 14:30
    expect(options[0]).toBe('14:30');
    // The last available slot should be 19:00
    expect(options[options.length - 1]).toBe('19:00');
  });
});
