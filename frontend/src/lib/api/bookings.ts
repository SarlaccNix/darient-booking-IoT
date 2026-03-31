import { apiClient } from './client';
import type { Booking, CreateBookingPayload, PaginatedResponse } from '@/types';

export interface BookingQueryParams {
  page?: number;
  pageSize?: number;
  spaceId?: string;
  clientEmail?: string;
}

export const bookingsApi = {
  getAll: (params: BookingQueryParams = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.pageSize) qs.set('pageSize', String(params.pageSize));
    if (params.spaceId) qs.set('spaceId', params.spaceId);
    if (params.clientEmail) qs.set('clientEmail', params.clientEmail);
    const query = qs.toString();
    return apiClient.get<PaginatedResponse<Booking>>(`/bookings${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => apiClient.get<Booking>(`/bookings/${id}`),

  create: (payload: CreateBookingPayload) => apiClient.post<Booking>('/bookings', payload),

  delete: (id: string) => apiClient.delete<void>(`/bookings/${id}`),
};
