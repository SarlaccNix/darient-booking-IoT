'use client';

import { useCallback, useEffect, useState } from 'react';
import { bookingsApi, type BookingQueryParams } from '@/lib/api/bookings';
import { ApiError } from '@/lib/api/client';
import type { Booking, PaginatedResponse } from '@/types';

export function useBookings(params: BookingQueryParams = {}) {
  const [result, setResult] = useState<PaginatedResponse<Booking> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<number | null>(null);

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    setErrorCode(null);
    bookingsApi
      .getAll(params)
      .then((data) => setResult(data))
      .catch((err: Error) => {
        setError(err.message);
        if (err instanceof ApiError) setErrorCode(err.statusCode);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.pageSize, params.spaceId, params.clientEmail]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { result, loading, error, errorCode, refetch: fetch };
}
