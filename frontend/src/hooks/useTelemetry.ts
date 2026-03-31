'use client';

import { useEffect, useRef, useState } from 'react';
import { telemetryApi, createTelemetryEventSource } from '@/lib/api/telemetry';
import type { Telemetry } from '@/types';

// Map of spaceId → latest Telemetry reading, kept in sync via SSE
export function useTelemetry() {
  const [latest, setLatest] = useState<Map<string, Telemetry>>(new Map());
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);

  // Initial load: fetch all latest readings via REST
  useEffect(() => {
    telemetryApi
      .getLatestAll()
      .then((readings) => {
        const map = new Map<string, Telemetry>();
        readings.forEach((r) => map.set(r.spaceId, r));
        setLatest(map);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  // SSE: update the map on each new reading
  useEffect(() => {
    const es = createTelemetryEventSource();
    esRef.current = es;

    es.onopen = () => setConnected(true);

    es.onmessage = (event: MessageEvent) => {
      try {
        const raw = JSON.parse(event.data);
        // SSE broadcasts the raw MQTT payload (snake_case). Normalize to match
        // the Telemetry type returned by the REST endpoint (camelCase).
        const reading: Telemetry = {
          id: raw.id ?? '',
          spaceId: raw.spaceId,
          siteId: raw.siteId,
          tempC: raw.tempC ?? raw.temp_c,
          humidityPct: raw.humidityPct ?? raw.humidity_pct,
          co2Ppm: raw.co2Ppm ?? raw.co2_ppm,
          occupancy: raw.occupancy,
          powerW: raw.powerW ?? raw.power_w,
          recordedAt: raw.recordedAt ?? raw.ts,
          createdAt: raw.createdAt ?? raw.ts,
          space: raw.space,
          site: raw.site,
        };
        setLatest((prev) => new Map(prev).set(reading.spaceId, reading));
      } catch {
        // ignore malformed events
      }
    };

    es.onerror = () => {
      setConnected(false);
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, []);

  return { latest, connected, error };
}
