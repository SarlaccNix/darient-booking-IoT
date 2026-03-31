import type { Telemetry } from '@/types';

interface SpaceTelemetryCardProps {
  reading: Telemetry;
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value}</span>
    </div>
  );
}

function co2Status(ppm: number): { color: string; label: string } {
  if (ppm < 800) return { color: 'bg-green-100 text-green-700', label: 'Good' };
  if (ppm < 1200) return { color: 'bg-yellow-100 text-yellow-700', label: 'Moderate' };
  return { color: 'bg-red-100 text-red-700', label: 'High' };
}

export function SpaceTelemetryCard({ reading }: SpaceTelemetryCardProps) {
  const status = co2Status(reading.co2Ppm);
  const updatedAt = new Date(reading.recordedAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            {reading.space?.name ?? reading.spaceId}
          </h3>
          {reading.site && (
            <p className="text-xs text-gray-400">{reading.site.name}</p>
          )}
        </div>
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>
          CO₂ {status.label}
        </span>
      </div>

      <div className="space-y-1.5">
        <MetricRow label="Temperature" value={`${reading.tempC.toFixed(1)} °C`} />
        <MetricRow label="Humidity" value={`${reading.humidityPct.toFixed(1)} %`} />
        <MetricRow label="CO₂" value={`${reading.co2Ppm} ppm`} />
        <MetricRow
          label="Occupancy"
          value={`${reading.occupancy}${reading.space ? ` / ${reading.space.capacity}` : ''}`}
        />
        <MetricRow label="Power" value={`${reading.powerW} W`} />
      </div>

      <p className="mt-3 text-right text-xs text-gray-400">Updated {updatedAt}</p>
    </div>
  );
}
