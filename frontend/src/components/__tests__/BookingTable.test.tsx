import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BookingTable } from '../BookingTable';

// Mock the useBookings hook
vi.mock('@/hooks/useBookings', () => ({
  useBookings: vi.fn(),
}));

import { useBookings } from '@/hooks/useBookings';

const mockBookings = [
  {
    id: 'booking_1',
    spaceId: 'space_1',
    siteId: 'site_1',
    clientEmail: 'alice@example.com',
    bookingDate: '2025-06-10T00:00:00.000Z',
    startTime: '2025-06-10T09:00:00.000Z',
    endTime: '2025-06-10T10:00:00.000Z',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    space: { id: 'space_1', name: 'Board Room' },
    site: { id: 'site_1', name: 'Alpha Tower' },
  },
  {
    id: 'booking_2',
    spaceId: 'space_2',
    siteId: 'site_1',
    clientEmail: 'bob@example.com',
    bookingDate: '2025-06-11T00:00:00.000Z',
    startTime: '2025-06-11T14:00:00.000Z',
    endTime: '2025-06-11T15:00:00.000Z',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    space: { id: 'space_2', name: 'Focus Pod A' },
    site: { id: 'site_1', name: 'Alpha Tower' },
  },
];

describe('BookingTable', () => {
  it('renders a loading spinner while loading', () => {
    vi.mocked(useBookings).mockReturnValue({
      result: null,
      loading: true,
      error: null,
      errorCode: null,

      refetch: vi.fn(),
    });

    const { container } = render(<BookingTable />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders an error message on error', () => {
    vi.mocked(useBookings).mockReturnValue({
      result: null,
      loading: false,
      error: 'Failed to fetch',
      errorCode: null,

      refetch: vi.fn(),
    });

    render(<BookingTable />);
    expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
  });

  it('renders "No bookings found" when data is empty', () => {
    vi.mocked(useBookings).mockReturnValue({
      result: { data: [], meta: { total: 0, page: 1, pageSize: 10, totalPages: 0 } },
      loading: false,
      error: null,
      errorCode: null,

      refetch: vi.fn(),
    });

    render(<BookingTable />);
    expect(screen.getByText('No bookings found.')).toBeInTheDocument();
  });

  it('renders booking rows correctly', () => {
    vi.mocked(useBookings).mockReturnValue({
      result: {
        data: mockBookings,
        meta: { total: 2, page: 1, pageSize: 10, totalPages: 1 },
      },
      loading: false,
      error: null,
      errorCode: null,

      refetch: vi.fn(),
    });

    render(<BookingTable />);
    expect(screen.getByText('Board Room')).toBeInTheDocument();
    expect(screen.getByText('Focus Pod A')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
  });

  it('does not render pagination when totalPages is 1', () => {
    vi.mocked(useBookings).mockReturnValue({
      result: {
        data: mockBookings,
        meta: { total: 2, page: 1, pageSize: 10, totalPages: 1 },
      },
      loading: false,
      error: null,
      errorCode: null,

      refetch: vi.fn(),
    });

    render(<BookingTable />);
    expect(screen.queryByText('Previous')).not.toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });

  it('renders pagination controls when totalPages > 1', () => {
    vi.mocked(useBookings).mockReturnValue({
      result: {
        data: mockBookings,
        meta: { total: 25, page: 1, pageSize: 10, totalPages: 3 },
      },
      loading: false,
      error: null,
      errorCode: null,

      refetch: vi.fn(),
    });

    render(<BookingTable />);
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
  });
});
