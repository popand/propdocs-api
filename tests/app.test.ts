import { buildApp } from '../src/app';
import { FastifyInstance } from 'fastify';

describe('App Integration Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Endpoints', () => {
    test('GET /health should return status ok', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('ok');
      expect(body).toHaveProperty('timestamp');
      expect(body).toHaveProperty('uptime');
      expect(body).toHaveProperty('memory');
    });

    test('GET /ready should return status with service health', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/ready',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('timestamp');
      expect(body).toHaveProperty('services');
      expect(body.services).toHaveProperty('database');
      expect(body.services).toHaveProperty('redis');
      
      // In test environment, services might not be available
      expect(['ready', 'not ready']).toContain(body.status);
    });
  });

  describe('CORS Configuration', () => {
    test('should include CORS headers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
        headers: {
          origin: 'http://localhost:3000',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });
  });

  describe('Security Headers', () => {
    test('should include security headers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });
  });
});