import { ConflictException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from '../../src/services/bookings.service';
import { PrismaService } from '../../src/prisma/prisma.service';

// Helpers
const makeDate = (dateStr: string) => new Date(dateStr);

const mockBooking = (overrides = {}) => ({
  id: 'booking_1',
  spaceId: 'space_1',
  siteId: 'site_1',
  clientEmail: 'test@example.com',
  bookingDate: makeDate('2025-06-10'),
  startTime: makeDate('2025-06-10T09:00:00Z'),
  endTime: makeDate('2025-06-10T10:00:00Z'),
  createdAt: new Date(),
  updatedAt: new Date(),
  space: { id: 'space_1', name: 'Board Room' },
  site: { id: 'site_1', name: 'Alpha Tower' },
  ...overrides,
});

const mockPrisma = {
  booking: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  bookingWeeklySummary: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    updateMany: jest.fn(),
  },
  space: {
    findUnique: jest.fn(),
  },
  site: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn((cb) => cb(mockPrisma)),
};

describe('BookingsService', () => {
  let service: BookingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    jest.clearAllMocks();
    // Re-wire $transaction after clearAllMocks resets it
    mockPrisma.$transaction.mockImplementation((cb) => cb(mockPrisma));
  });

  describe('Business Rule 1 — Time Conflict Detection', () => {
    const createDto = {
      spaceId: 'space_1',
      clientEmail: 'test@example.com',
      bookingDate: '2025-06-10',
      startTime: '2025-06-10T09:00:00Z',
      endTime: '2025-06-10T10:00:00Z',
    };

    beforeEach(() => {
      mockPrisma.space.findUnique.mockResolvedValue({ id: 'space_1', siteId: 'site_1', name: 'Board Room' });
      mockPrisma.bookingWeeklySummary.findUnique.mockResolvedValue(null);
      mockPrisma.bookingWeeklySummary.upsert.mockResolvedValue({ count: 1 });
    });

    it('should reject with 409 when an overlapping booking exists', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue(mockBooking()); // conflict exists

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should allow booking when no overlap exists', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue(null); // no conflict
      mockPrisma.booking.create.mockResolvedValue(mockBooking());

      const result = await service.create(createDto);
      expect(result).toBeDefined();
    });
  });

  describe('Business Rule 2 — Weekly Booking Limit', () => {
    const createDto = {
      spaceId: 'space_1',
      clientEmail: 'client@example.com',
      bookingDate: '2025-06-10',
      startTime: '2025-06-10T14:00:00Z',
      endTime: '2025-06-10T15:00:00Z',
    };

    beforeEach(() => {
      mockPrisma.space.findUnique.mockResolvedValue({ id: 'space_1', siteId: 'site_1', name: 'Board Room' });
      mockPrisma.booking.findFirst.mockResolvedValue(null); // no conflict
    });

    it('should reject with 422 when client already has 3 bookings this week', async () => {
      mockPrisma.bookingWeeklySummary.findUnique.mockResolvedValue({ count: 3 });

      await expect(service.create(createDto)).rejects.toThrow(UnprocessableEntityException);
    });

    it('should allow booking when client has fewer than 3 bookings this week', async () => {
      mockPrisma.bookingWeeklySummary.findUnique.mockResolvedValue({ count: 2 });
      mockPrisma.booking.create.mockResolvedValue(mockBooking());
      mockPrisma.bookingWeeklySummary.upsert.mockResolvedValue({ count: 3 });

      const result = await service.create(createDto);
      expect(result).toBeDefined();
    });

    it('should allow booking when client has 0 bookings this week (no summary row)', async () => {
      mockPrisma.bookingWeeklySummary.findUnique.mockResolvedValue(null);
      mockPrisma.booking.create.mockResolvedValue(mockBooking());
      mockPrisma.bookingWeeklySummary.upsert.mockResolvedValue({ count: 1 });

      const result = await service.create(createDto);
      expect(result).toBeDefined();
    });

    it('should increment the summary counter on successful booking', async () => {
      mockPrisma.bookingWeeklySummary.findUnique.mockResolvedValue(null);
      mockPrisma.booking.create.mockResolvedValue(mockBooking());
      mockPrisma.bookingWeeklySummary.upsert.mockResolvedValue({ count: 1 });

      await service.create(createDto);

      expect(mockPrisma.bookingWeeklySummary.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ clientEmail: 'client@example.com', count: 1 }),
          update: { count: { increment: 1 } },
        }),
      );
    });

    it('should decrement the summary counter on booking deletion', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(mockBooking({ clientEmail: 'client@example.com' }));
      mockPrisma.booking.delete.mockResolvedValue({});
      mockPrisma.bookingWeeklySummary.updateMany.mockResolvedValue({ count: 1 });

      await service.remove('booking_1');

      expect(mockPrisma.bookingWeeklySummary.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { count: { decrement: 1 } },
        }),
      );
    });
  });

  describe('siteId auto-population', () => {
    it('should populate siteId from the referenced space on create', async () => {
      const space = { id: 'space_1', siteId: 'site_alpha', name: 'Board Room' };
      mockPrisma.space.findUnique.mockResolvedValue(space);
      mockPrisma.booking.findFirst.mockResolvedValue(null);
      mockPrisma.bookingWeeklySummary.findUnique.mockResolvedValue(null);
      mockPrisma.booking.create.mockResolvedValue(mockBooking({ siteId: 'site_alpha' }));
      mockPrisma.bookingWeeklySummary.upsert.mockResolvedValue({ count: 1 });

      await service.create({
        spaceId: 'space_1',
        clientEmail: 'test@example.com',
        bookingDate: '2025-06-10',
        startTime: '2025-06-10T09:00:00Z',
        endTime: '2025-06-10T10:00:00Z',
      });

      const createCall = mockPrisma.booking.create.mock.calls[0][0];
      expect(createCall.data.siteId).toBe('site_alpha');
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when booking does not exist', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(null);
      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
