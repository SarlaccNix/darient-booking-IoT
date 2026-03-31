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

describe('Spaces Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
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
    await prisma.booking.deleteMany();
    await prisma.space.deleteMany();
    await prisma.site.deleteMany();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.booking.deleteMany();
    await prisma.space.deleteMany();
    await prisma.site.deleteMany();

    const site = await prisma.site.create({
      data: { name: 'Test Site', latitude: 8.99, longitude: -79.5 },
    });
    siteId = site.id;
  });

  describe('POST /api/v1/spaces', () => {
    it('should create a space with valid siteId', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/spaces')
        .set('x-api-key', API_KEY)
        .send({ siteId, name: 'Board Room', capacity: 12 });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Board Room');
      expect(res.body.siteId).toBe(siteId);
    });

    it('should return 404 when siteId does not exist', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/spaces')
        .set('x-api-key', API_KEY)
        .send({ siteId: 'nonexistent', name: 'Room', capacity: 5 });
      expect(res.status).toBe(404);
    });

    it('should return 400 when capacity is missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/spaces')
        .set('x-api-key', API_KEY)
        .send({ siteId, name: 'Room' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/spaces', () => {
    it('should filter by siteId', async () => {
      await prisma.space.createMany({
        data: [
          { siteId, name: 'Space A', capacity: 5 },
          { siteId, name: 'Space B', capacity: 3 },
        ],
      });

      const otherSite = await prisma.site.create({
        data: { name: 'Other Site', latitude: 1.0, longitude: 1.0 },
      });
      await prisma.space.create({ data: { siteId: otherSite.id, name: 'Space C', capacity: 2 } });

      const res = await request(app.getHttpServer())
        .get(`/api/v1/spaces?siteId=${siteId}`)
        .set('x-api-key', API_KEY);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body.every((s: { siteId: string }) => s.siteId === siteId)).toBe(true);
    });
  });

  describe('GET /api/v1/spaces/:id', () => {
    it('should return 404 for unknown space', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/spaces/nonexistent')
        .set('x-api-key', API_KEY);
      expect(res.status).toBe(404);
    });
  });
});
