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

describe('Sites Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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
  });

  describe('GET /api/v1/sites', () => {
    it('should return 401 without API key', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/sites');
      expect(res.status).toBe(401);
    });

    it('should return empty array when no sites', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/sites')
        .set('x-api-key', API_KEY);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('POST /api/v1/sites', () => {
    it('should create a site and return 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/sites')
        .set('x-api-key', API_KEY)
        .send({ name: 'Test Site', latitude: 8.99, longitude: -79.5 });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Test Site');
      expect(res.body.id).toBeDefined();
    });

    it('should return 400 when name is missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/sites')
        .set('x-api-key', API_KEY)
        .send({ latitude: 8.99, longitude: -79.5 });
      expect(res.status).toBe(400);
    });

    it('should return 400 when latitude is invalid', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/sites')
        .set('x-api-key', API_KEY)
        .send({ name: 'Bad Site', latitude: 'not-a-number', longitude: -79.5 });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/sites/:id', () => {
    it('should return 404 for unknown ID', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/sites/nonexistent_id')
        .set('x-api-key', API_KEY);
      expect(res.status).toBe(404);
    });

    it('should return the site when it exists', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/sites')
        .set('x-api-key', API_KEY)
        .send({ name: 'Alpha', latitude: 8.99, longitude: -79.5 });

      const res = await request(app.getHttpServer())
        .get(`/api/v1/sites/${created.body.id}`)
        .set('x-api-key', API_KEY);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Alpha');
    });
  });

  describe('PUT /api/v1/sites/:id', () => {
    it('should update the site', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/sites')
        .set('x-api-key', API_KEY)
        .send({ name: 'Original', latitude: 8.99, longitude: -79.5 });

      const res = await request(app.getHttpServer())
        .put(`/api/v1/sites/${created.body.id}`)
        .set('x-api-key', API_KEY)
        .send({ name: 'Updated' });
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated');
    });
  });

  describe('DELETE /api/v1/sites/:id', () => {
    it('should delete the site and return 204', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/sites')
        .set('x-api-key', API_KEY)
        .send({ name: 'ToDelete', latitude: 8.99, longitude: -79.5 });

      const res = await request(app.getHttpServer())
        .delete(`/api/v1/sites/${created.body.id}`)
        .set('x-api-key', API_KEY);
      expect(res.status).toBe(204);
    });
  });
});
