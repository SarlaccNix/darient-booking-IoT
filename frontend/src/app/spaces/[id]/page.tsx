'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { spacesApi } from '@/lib/api/spaces';
import { ApiError } from '@/lib/api/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import type { Space } from '@/types';

export default function SpaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setErrorCode(null);

    spacesApi
      .getById(id)
      .then(setSpace)
      .catch((err: Error) => {
        setError(err.message);
        if (err instanceof ApiError) setErrorCode(err.statusCode);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <Link href="/spaces" className="text-sm text-indigo-600 hover:text-indigo-800">
          ← Back to spaces
        </Link>
        <div className="mt-6">
          <ErrorMessage message={error} statusCode={errorCode} />
        </div>
      </main>
    );
  }

  if (!space) return null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href="/spaces" className="text-sm text-indigo-600 hover:text-indigo-800">
        ← Back to spaces
      </Link>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <h1 className="text-xl font-bold text-gray-900">{space.name}</h1>
          <span className="ml-3 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
            {space.capacity} {space.capacity === 1 ? 'seat' : 'seats'}
          </span>
        </div>

        {space.site && (
          <p className="mt-1 text-sm font-medium text-gray-500">{space.site.name}</p>
        )}

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {space.locationReference && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Location
              </dt>
              <dd className="mt-1 text-sm text-gray-700">{space.locationReference}</dd>
            </div>
          )}

          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Capacity
            </dt>
            <dd className="mt-1 text-sm text-gray-700">{space.capacity} people</dd>
          </div>
        </dl>

        {space.description && (
          <div className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Description
            </h2>
            <p className="mt-1 text-sm text-gray-700">{space.description}</p>
          </div>
        )}

        <div className="mt-8">
          <Link
            href={`/bookings/new?spaceId=${space.id}`}
            className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Book this space
          </Link>
        </div>
      </div>
    </main>
  );
}
