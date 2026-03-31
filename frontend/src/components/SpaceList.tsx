'use client';

import { useSpaces } from '@/hooks/useSpaces';
import { SpaceCard } from './SpaceCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export function SpaceList() {
  const { spaces, loading, error, errorCode } = useSpaces();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} statusCode={errorCode} />;
  if (spaces.length === 0)
    return <p className="text-center text-gray-500 py-12">No spaces found.</p>;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {spaces.map((space) => (
        <SpaceCard key={space.id} space={space} />
      ))}
    </div>
  );
}
