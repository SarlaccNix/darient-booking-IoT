'use client';

import { useEffect, useState } from 'react';
import { spacesApi } from '@/lib/api/spaces';
import { ApiError } from '@/lib/api/client';
import type { Space } from '@/types';

export function useSpaces(siteId?: string) {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setErrorCode(null);

    spacesApi
      .getAll(siteId)
      .then((data) => {
        if (!cancelled) setSpaces(data);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
          if (err instanceof ApiError) setErrorCode(err.statusCode);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [siteId]);

  return { spaces, loading, error, errorCode };
}
