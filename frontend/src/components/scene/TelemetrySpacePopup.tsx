'use client';

import { useEffect, useState } from 'react';
import { telemetryApi } from '@/lib/api/telemetry';
import type { Telemetry } from '@/types';

interface TelemetrySpacePopupProps {
  spaceId: string;
  spaceName: string;
  siteName: string;
  latest: Telemetry | undefined;
  onClose: () => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value}</span>
    </div>
  );
}

export function TelemetrySpacePopup({
  spaceId,
  spaceName,
  siteName,
  latest,
  onClose,
}: TelemetrySpacePopupProps) {
  const [history, setHistory] = useState<Telemetry[]>([]);

  useEffect(() => {
    setHistory([]);
    telemetryApi.getHistory(spaceId, 1, 8).then((r) => setHistory(r.data)).catch(() => {});
  }, [spaceId]);

  return (
    <div className="absolute right-0 top-0 h-full w-72 overflow-y-auto border-l border-gray-200 bg-white p-4 shadow-xl z-10">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{spaceName}</h3>
          <p className="text-xs text-gray-400">{siteName}</p>
        </div>
        <button
          onClick={onClose}
          className="mt-0.5 text-gray-400 hover:text-gray-600 text-lg leading-none"
        >
          ✕
        </button>
      </div>

      {latest ? (
        <div className="mb-4 space-y-2 rounded-lg bg-gray-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Latest Reading
          </p>
          <Row label="Temperature" value={`${latest.tempC.toFixed(1)} °C`} />
          <Row label="Humidity" value={`${latest.humidityPct.toFixed(1)} %`} />
          <Row label="CO₂" value={`${latest.co2Ppm} ppm`} />
          <Row label="Occupancy" value={String(latest.occupancy)} />
          <Row label="Power" value={`${latest.powerW} W`} />
          <p className="pt-1 text-right text-xs text-gray-400">
            {new Date(latest.recordedAt).toLocaleTimeString()}
          </p>
        </div>
      ) : (
        <p className="mb-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-400">
          No live data for this space yet.
        </p>
      )}

      {history.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            Recent History
          </p>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400">
                <th className="pb-1 text-left font-medium">Time</th>
                <th className="pb-1 text-right font-medium">°C</th>
                <th className="pb-1 text-right font-medium">CO₂</th>
                <th className="pb-1 text-right font-medium">Occ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map((r) => (
                <tr key={r.id}>
                  <td className="py-1 text-gray-500">
                    {new Date(r.recordedAt).toLocaleTimeString()}
                  </td>
                  <td className="py-1 text-right">{r.tempC.toFixed(1)}</td>
                  <td className="py-1 text-right">{r.co2Ppm}</td>
                  <td className="py-1 text-right">{r.occupancy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
