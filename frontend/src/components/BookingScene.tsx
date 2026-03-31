'use client';

import dynamic from 'next/dynamic';
import { Suspense, useState } from 'react';
import { CreateBookingForm } from './CreateBookingForm';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { useSiteSpaces } from '@/hooks/useSiteSpaces';
import { useSceneSpaceStatus } from '@/hooks/useSceneSpaceStatus';

const SceneCanvas = dynamic(
  () => import('./scene/SceneCanvas').then((m) => m.SceneCanvas),
  { ssr: false, loading: () => <LoadingSpinner /> },
);

const SITES = [
  { id: 'site_alpha', label: 'Alpha Tower' },
  { id: 'site_beta',  label: 'Beta Hub' },
];

export function BookingScene() {
  const [siteId, setSiteId] = useState('site_alpha');
  const [selectedSpaceId, setSelectedSpaceId] = useState('');
  const [bookingDate, setBookingDate] = useState('');

  const spaces = useSiteSpaces(siteId);
  const spaceStatuses = useSceneSpaceStatus(siteId, bookingDate);

  return (
    <div className="space-y-6">
      {/* Site tab switcher */}
      <div className="flex gap-2 border-b border-gray-200">
        {SITES.map((site) => (
          <button
            key={site.id}
            onClick={() => { setSiteId(site.id); setSelectedSpaceId(''); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              siteId === site.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {site.label}
          </button>
        ))}
      </div>

      {/* 3D floor plan */}
      <div className="rounded-xl border border-gray-200 overflow-hidden" style={{ height: 340 }}>
        <SceneCanvas
          mode="booking"
          spaces={spaces}
          selectedSpaceId={selectedSpaceId}
          onSpaceSelect={setSelectedSpaceId}
          spaceStatuses={spaceStatuses}
        />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-green-500" /> Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-red-500" /> Booked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-blue-500" /> Selected
        </span>
        <span className="ml-auto italic">Click a space to select it</span>
      </div>

      {/* Booking form — always visible, space pre-fills from scene click */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Booking details</h2>
        <Suspense fallback={<LoadingSpinner />}>
          <CreateBookingForm
            externalSpaceId={selectedSpaceId}
            onBookingDateChange={setBookingDate}
          />
        </Suspense>
      </div>
    </div>
  );
}
