'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useTelemetry } from '@/hooks/useTelemetry';
import { useSiteSpaces } from '@/hooks/useSiteSpaces';
import { SpaceTelemetryCard } from '@/components/SpaceTelemetryCard';
import { TelemetrySpacePopup } from '@/components/scene/TelemetrySpacePopup';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const SceneCanvas = dynamic(
  () => import('@/components/scene/SceneCanvas').then((m) => m.SceneCanvas),
  { ssr: false, loading: () => <LoadingSpinner /> },
);

const SITES = [
  { id: 'site_alpha', label: 'Alpha Tower' },
  { id: 'site_beta',  label: 'Beta Hub' },
];

export default function AdminPage() {
  const { latest, connected, error } = useTelemetry();
  const [view, setView] = useState<'card' | '3d'>('card');
  const [siteId, setSiteId] = useState('site_alpha');
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);

  const spaces = useSiteSpaces(siteId);

  const readings = Array.from(latest.values()).sort((a, b) =>
    (a.space?.name ?? a.spaceId).localeCompare(b.space?.name ?? b.spaceId),
  );

  const selectedSpace = spaces.find((s) => s.id === selectedSpaceId);
  const selectedSite = SITES.find((s) => s.id === siteId);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Live sensor readings from all spaces.</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                connected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`}
            />
            {connected ? 'Live' : 'Connecting…'}
          </span>

          {/* Card / 3D toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
            <button
              onClick={() => setView('card')}
              className={`px-3 py-1.5 transition-colors ${
                view === 'card'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Card View
            </button>
            <button
              onClick={() => setView('3d')}
              className={`px-3 py-1.5 transition-colors ${
                view === '3d'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              3D View
            </button>
          </div>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* ── Card View ── */}
      {view === 'card' && (
        <>
          {readings.length === 0 && !error ? (
            <div className="flex flex-col items-center py-16 text-gray-400">
              <LoadingSpinner />
              <p className="mt-4 text-sm">Waiting for telemetry data…</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {readings.map((reading) => (
                <SpaceTelemetryCard key={reading.spaceId} reading={reading} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── 3D View ── */}
      {view === '3d' && (
        <div className="space-y-4">
          {/* Site tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            {SITES.map((site) => (
              <button
                key={site.id}
                onClick={() => { setSiteId(site.id); setSelectedSpaceId(null); }}
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

          {/* Scene + optional popup side panel */}
          <div className="relative rounded-xl border border-gray-200 overflow-hidden" style={{ height: 420 }}>
            <SceneCanvas
              mode="telemetry"
              spaces={spaces}
              selectedSpaceId={selectedSpaceId ?? undefined}
              onSpaceSelect={(id) => setSelectedSpaceId((prev) => (prev === id ? null : id))}
              telemetryLatest={latest}
            />

            {selectedSpaceId && selectedSpace && (
              <TelemetrySpacePopup
                spaceId={selectedSpaceId}
                spaceName={selectedSpace.name}
                siteName={selectedSite?.label ?? siteId}
                latest={latest.get(selectedSpaceId)}
                onClose={() => setSelectedSpaceId(null)}
              />
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-green-500" /> All nominal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-amber-400" /> Warning
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-red-500" /> Critical
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-gray-400" /> No data
            </span>
            <span className="ml-auto italic">Click a space for details · pulse = occupied</span>
          </div>
        </div>
      )}
    </main>
  );
}
