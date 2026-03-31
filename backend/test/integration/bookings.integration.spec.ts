import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';
import { Reflector } from '@nestjs/core';
import { ApiKeyGuard } from '../../src/common/guards/api-key.guard';

const API_KEY = 'test-integration-key';
process.env.API_KEY = API_KEY;
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;

describe('Bookings Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let spaceId: string;
  let siteId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalGuards(new ApiKeyGuard(app.get(Reflector)));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.bookingWeeklySummary.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.space.deleteMany();
    await prisma.site.deleteMany();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.bookingWeeklySummary.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.space.deleteMany();
    await prisma.site.deleteMany();

    const site = await prisma.site.create({
      data: { name: 'Test Site', latitude: 8.99, longitude: -79.5 },
    });
    siteId = site.id;

    const space = await prisma.space.create({
      data: { siteId, name: 'Board Room', capacity: 12 },
    });
    spaceId = space.id;
  });

  const makeBookingDto = (overrides: Record<string, string> = {}) => ({
    spaceId,
    clientEmail: 'test@example.com',
    bookingDate: '2025-06-10T00:00:00.000Z',
    startTime: '2025-06-10T09:00:00.000Z',
    endTime: '2025-06-10T10:00:00.000Z',
    ...overrides,
  });

  describe('POST /api/v1/bookings', () => {
    it('should return 401 without API key', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/bookings')
        .send(makeBookingDto());
      expect(res.status).toBe(401);
    });

    it('should create a booking and return 201 with siteId auto-populated', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/bookings')
        .set('x-api-key', API_KEY)
        .send(makeBookingDto());
      expect(res.status).toBe(201);
      expect(res.body.spaceId).toBe(spaceId);
      expect(res.body.siteId).toBe(siteId);
      expect(res.body.clientEmail).toBe('test@example.com');
    });

    it('should return 409 when booking overlaps existing booking', async () => {
      // Create first booking
      await request(app.getHttpServer())
        .post('/api/v1/bookings')
        .set('x-api-key', API_KEY)
        .send(makeBookingDto());

      // Overlapping booking (same time window)
      const res = await request(app.getHttpServer())
        .post('/api/v1/bookings')
        .set('x-api-key', API_KEY)
        .send(makeBookingDto({ clientEmail: 'other@example.com' }));
      expect(res.status).toBe(409);
    });

    it('should return 422 when client exceeds 3 bookings in the same week', async () => {
      const client = 'weekly@example.com';
      const days = ['2025-06-09', '2025-06-10', '2025-06-11'];

      for (const day of days) {
        await request(app.getHttpServer())
          .post('/api/v1/bookings')
          .set('x-api-key', API_KEY)
          .send(
            makeBookingDto({
              clientEmail: client,
              bookingDate: `${day}T00:00:00.000Z`,
              startTime: `${day}T09:00:00.000Z`,
              endTime: `${day}T10:00:00.000Z`,
            }),
          );
      }

      // 4th booking in same week
      const res = await request(app.getHttpServer())
        .post('/api/v1/bookings')
        .set('x-api-key', API_KEY)
        .send(
          makeBookingDto({
            clientEmail: client,
            bookingDate: '2025-06-12T00:00:00.000Z',
            startTime: '2025-06-12T09:00:00.000Z',
            endTime: '2025-06-12T10:00:00.000Z',
          }),
        );
      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/v1/bookings', () => {
    it('should return paginated response envelope', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/bookings')
        .set('x-api-key', API_KEY)
        .send(makeBookingDto());

      const res = await request(app.getHttpServer())
        .get('/api/v1/bookings?page=1&pageSize=10')
        .set('x-api-key', API_KEY);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(res.body.meta).toMatchObject({ page: 1, pageSize: 10 });
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('DELETE /api/v1/bookings/:id', () => {
    it('should delete a booking and return 204', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/bookings')
        .set('x-api-key', API_KEY)
        .send(makeBookingDto());

      const res = await request(app.getHttpServer())
        .delete(`/api/v1/bookings/${created.body.id}`)
        .set('x-api-key', API_KEY);
      expect(res.status).toBe(204);
    });

    it('should return 404 for non-existent booking', async () => {
      const res = await request(app.getHttpServer())
        .delete('/api/v1/bookings/nonexistent')
        .set('x-api-key', API_KEY);
      expect(res.status).toBe(404);
    });
  });
});
