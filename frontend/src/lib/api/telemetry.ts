import { apiClient } from './client';
import type { Telemetry, PaginatedResponse } from '@/types';

export const telemetryApi = {
  getLatestAll: () => apiClient.get<Telemetry[]>('/telemetry'),
  getLatest: (spaceId: string) => apiClient.get<Telemetry | null>(`/telemetry/${spaceId}/latest`),
  getHistory: (spaceId: string, page = 1, pageSize = 20) =>
    apiClient.get<PaginatedResponse<Telemetry>>(
      `/telemetry/${spaceId}/history?page=${page}&pageSize=${pageSize}`,
    ),
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function createTelemetryEventSource(): EventSource {
  return new EventSource(`${API_BASE}/api/v1/telemetry/stream`);
}
