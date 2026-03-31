export interface Site {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

export interface Space {
  id: string;
  siteId: string;
  name: string;
  locationReference: string | null;
  capacity: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  site?: Pick<Site, 'id' | 'name'>;
}

export interface Booking {
  id: string;
  spaceId: string;
  siteId: string;
  clientEmail: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  space?: Pick<Space, 'id' | 'name'>;
  site?: Pick<Site, 'id' | 'name'>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  timestamp?: string;
  path?: string;
}

export interface CreateBookingPayload {
  spaceId: string;
  clientEmail: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
}

export interface Telemetry {
  id: string;
  spaceId: string;
  siteId: string;
  tempC: number;
  humidityPct: number;
  co2Ppm: number;
  occupancy: number;
  powerW: number;
  recordedAt: string;
  createdAt: string;
  space?: Pick<Space, 'id' | 'name' | 'capacity'>;
  site?: Pick<Site, 'id' | 'name'>;
}
