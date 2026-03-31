import Link from 'next/link';
import type { Space } from '@/types';

interface SpaceCardProps {
  space: Space;
}

export function SpaceCard({ space }: SpaceCardProps) {
  return (
    <Link
      href={`/spaces/${space.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <h3 className="text-base font-semibold text-gray-900">{space.name}</h3>
        <span className="ml-2 inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
          {space.capacity} {space.capacity === 1 ? 'seat' : 'seats'}
        </span>
      </div>

      {space.locationReference && (
        <p className="mt-1 text-sm text-gray-500">{space.locationReference}</p>
      )}

      {space.site && (
        <p className="mt-2 text-xs text-gray-400">{space.site.name}</p>
      )}

      {space.description && (
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{space.description}</p>
      )}
    </Link>
  );
}
