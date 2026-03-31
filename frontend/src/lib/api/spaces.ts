import { apiClient } from './client';
import type { Space } from '@/types';

export const spacesApi = {
  getAll: (siteId?: string) =>
    apiClient.get<Space[]>(`/spaces${siteId ? `?siteId=${siteId}` : ''}`),

  getById: (id: string) => apiClient.get<Space>(`/spaces/${id}`),
};
