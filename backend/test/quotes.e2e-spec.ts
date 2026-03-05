import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

/**
 * E2E Integration Tests for Quotes and Policies API
 * These tests require a running PostgreSQL database.
 * Run: npm run test:e2e
 */
describe('Quotes & Policies API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let quoteId: string;
  let policyId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /catalogs/insurance-types', () => {
    it('should return insurance types', async () => {
      const res = await request(app.getHttpServer())
        .get('/catalogs/insurance-types')
        .expect(200);

      expect(res.body.items).toBeDefined();
      expect(res.body.items.length).toBeGreaterThan(0);
      expect(res.body.items[0]).toHaveProperty('code');
      expect(res.body.items[0]).toHaveProperty('name');
    });
  });

  describe('GET /catalogs/coverages', () => {
    it('should return all coverages without filter', async () => {
      const res = await request(app.getHttpServer())
        .get('/catalogs/coverages')
        .expect(200);

      expect(res.body.items).toBeDefined();
    });

    it('should filter coverages by insuranceType', async () => {
      const res = await request(app.getHttpServer())
        .get('/catalogs/coverages?insuranceType=AUTO')
        .expect(200);

      expect(res.body.items).toBeDefined();
      expect(res.body.items.length).toBeGreaterThan(0);
    });
  });

  describe('GET /catalogs/locations', () => {
    it('should return locations list', async () => {
      const res = await request(app.getHttpServer())
        .get('/catalogs/locations')
        .expect(200);

      expect(res.body.items).toBeDefined();
      expect(res.body.items.length).toBeGreaterThan(0);
    });
  });

  describe('POST /auth/login', () => {
    it('should return JWT token with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'Password123!' })
        .expect(200);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.tokenType).toBe('Bearer');
      authToken = res.body.accessToken;
    });

    it('should return 401 with invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'wrong@example.com', password: 'wrongpassword' })
        .expect(401);
    });
  });

  describe('POST /quotes', () => {
    it('should create a quote and return premium + breakdown', async () => {
      const res = await request(app.getHttpServer())
        .post('/quotes')
        .send({
          insuranceType: 'AUTO',
          coverage: 'PREMIUM',
          age: 35,
          location: 'EC-AZUAY',
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.status).toBe('QUOTED');
      expect(res.body.estimatedPremium).toBeGreaterThan(0);
      expect(res.body.breakdown).toHaveLength(4);
      expect(res.body.inputs).toMatchObject({
        insuranceType: 'AUTO',
        coverage: 'PREMIUM',
        age: 35,
        location: 'EC-AZUAY',
      });
      quoteId = res.body.id;
    });

    it('should reject invalid insuranceType', async () => {
      const res = await request(app.getHttpServer())
        .post('/quotes')
        .send({
          insuranceType: 'VIDA',
          coverage: 'PREMIUM',
          age: 35,
          location: 'EC-AZUAY',
        })
        .expect(400);

      expect(res.body.status).toBe(400);
    });

    it('should reject invalid location', async () => {
      await request(app.getHttpServer())
        .post('/quotes')
        .send({
          insuranceType: 'AUTO',
          coverage: 'PREMIUM',
          age: 35,
          location: 'INVALID-LOCATION',
        })
        .expect(400);
    });

    it('should reject age below minimum (18)', async () => {
      await request(app.getHttpServer())
        .post('/quotes')
        .send({
          insuranceType: 'AUTO',
          coverage: 'PREMIUM',
          age: 15,
          location: 'EC-AZUAY',
        })
        .expect(400);
    });
  });

  describe('GET /quotes/:id', () => {
    it('should return the persisted quote', async () => {
      const res = await request(app.getHttpServer())
        .get(`/quotes/${quoteId}`)
        .expect(200);

      expect(res.body.id).toBe(quoteId);
      expect(res.body.status).toBeDefined();
    });

    it('should return 404 for non-existent quote', async () => {
      await request(app.getHttpServer())
        .get('/quotes/non-existent-uuid')
        .expect(404);
    });
  });

  describe('POST /policies (protected)', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/policies')
        .send({ quoteId })
        .expect(401);
    });

    it('should emit policy with valid token', async () => {
      const res = await request(app.getHttpServer())
        .post('/policies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quoteId })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.quoteId).toBe(quoteId);
      expect(res.body.status).toBe('ACTIVE');
      expect(res.body.issuedAt).toBeDefined();
      policyId = res.body.id;
    });

    it('should reject double emission for same quote', async () => {
      await request(app.getHttpServer())
        .post('/policies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quoteId })
        .expect(409);
    });
  });

  describe('GET /policies/:id (protected)', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get(`/policies/${policyId}`)
        .expect(401);
    });

    it('should return policy with valid token', async () => {
      const res = await request(app.getHttpServer())
        .get(`/policies/${policyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.id).toBe(policyId);
      expect(res.body.status).toBe('ACTIVE');
    });

    it('should return 404 for non-existent policy', async () => {
      await request(app.getHttpServer())
        .get('/policies/non-existent-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
