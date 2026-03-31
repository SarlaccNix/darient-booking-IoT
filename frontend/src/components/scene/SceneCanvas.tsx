'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { SceneLighting } from './SceneLighting';
import { SiteScene } from './SiteScene';
import type { Space, Telemetry } from '@/types';
import type { SpaceStatus } from '@/hooks/useSceneSpaceStatus';

export type SceneMode = 'booking' | 'telemetry';

interface SceneCanvasProps {
  mode: SceneMode;
  spaces: Space[];
  selectedSpaceId?: string;
  onSpaceSelect: (spaceId: string) => void;
  /** booking mode: map of spaceId → availability */
  spaceStatuses?: Record<string, SpaceStatus>;
  /** telemetry mode: map of spaceId → latest reading */
  telemetryLatest?: Map<string, Telemetry>;
}

function bookingColor(spaceId: string, statuses: Record<string, SpaceStatus>): string {
  return statuses[spaceId] === 'booked' ? '#ef4444' : '#22c55e';
}

function telemetryColor(reading: Telemetry | undefined): string {
  if (!reading) return '#9ca3af';
  const { co2Ppm, tempC, humidityPct } = reading;
  if (co2Ppm >= 1200 || tempC > 30 || tempC < 15 || humidityPct < 30 || humidityPct > 70)
    return '#ef4444';
  if (co2Ppm >= 800 || tempC > 27 || humidityPct < 35 || humidityPct > 65)
    return '#f59e0b';
  return '#22c55e';
}

export function SceneCanvas({
  mode,
  spaces,
  selectedSpaceId,
  onSpaceSelect,
  spaceStatuses = {},
  telemetryLatest = new Map(),
}: SceneCanvasProps) {
  const getColor = (spaceId: string) =>
    mode === 'booking'
      ? bookingColor(spaceId, spaceStatuses)
      : telemetryColor(telemetryLatest.get(spaceId));

  const getPulse = (spaceId: string) =>
    mode === 'telemetry' && (telemetryLatest.get(spaceId)?.occupancy ?? 0) > 0;

  return (
    <Canvas
      camera={{ position: [0, 10, 8], fov: 50 }}
      shadows
      style={{ background: '#f8fafc', borderRadius: '0.5rem' }}
    >
      <SceneLighting />
      <Suspense fallback={null}>
        <SiteScene
          spaces={spaces}
          selectedSpaceId={selectedSpaceId}
          onSpaceSelect={onSpaceSelect}
          getColor={getColor}
          getPulse={getPulse}
        />
      </Suspense>
      <OrbitControls
        makeDefault
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={5}
        maxDistance={22}
      />
    </Canvas>
  );
}
