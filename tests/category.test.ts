import request from 'supertest';
import app from '../app';
import Category from '../models/category';

const API_KEY = process.env.API_KEY || 'CrPHjMYUnyldTVorUxJFgcDUcNobwNfcHYr';

describe('POST /api/categories', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create a category successfully', async () => {
    const mockCategory = {
      id: 'mock-uuid-123',
      name: 'Electronics',
      created_at: new Date('2026-03-01T00:00:00Z'),
      updated_at: new Date('2026-03-01T00:00:00Z'),
    };

    jest.spyOn(Category, 'create').mockResolvedValue(mockCategory as any);

    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', API_KEY)
      .send({ name: 'Electronics' });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('id', 'mock-uuid-123');
    expect(res.body.data).toHaveProperty('name', 'Electronics');
    expect(res.body.data).toHaveProperty('createdAt');
    expect(typeof res.body.data.createdAt).toBe('number');
  });

  it('should return 400 if name is empty', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', API_KEY)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('name');
    expect(res.body.errors.name).toContain('name is empty');
  });

  it('should return 400 if name exceeds 255 characters', async () => {
    const longName = 'a'.repeat(256);

    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', API_KEY)
      .send({ name: longName });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('name');
    expect(res.body.errors.name).toContain('name length must not more than 255 characters');
  });

  it('should return 401 if Authorization header is missing', async () => {
    const res = await request(app)
      .post('/api/categories')
      .send({ name: 'Electronics' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Unauthorized');
  });

  it('should return 403 if API Key is invalid', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', 'wrong-api-key')
      .send({ name: 'Electronics' });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('message', 'Forbidden: Invalid API Key');
  });
});
