import request from 'supertest';
import app from '../app';
import Product from '../models/product';
import Category from '../models/category';

const API_KEY = process.env.API_KEY || 'CrPHjMYUnyldTVorUxJFgcDUcNobwNfcHYr';

describe('POST /api/products', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const validBody = {
    sku: 'SKU-001',
    name: 'Product A',
    price: 10000,
    stock: 50,
    categoryId: 'cat-uuid-123',
  };

  it('should create a product successfully', async () => {
    const mockProduct = {
      id: 'prod-uuid-123',
      sku: 'SKU-001',
      name: 'Product A',
      price: '10000',
      stock: 50,
      categoryId: 'cat-uuid-123',
      created_at: new Date('2026-03-01T00:00:00Z'),
      updated_at: new Date('2026-03-01T00:00:00Z'),
    };

    const mockCategory = {
      id: 'cat-uuid-123',
      name: 'Electronics',
    };

    jest.spyOn(Product, 'findOne').mockResolvedValue(null);
    jest.spyOn(Product, 'create').mockResolvedValue(mockProduct as any);
    jest.spyOn(Category, 'findByPk').mockResolvedValue(mockCategory as any);

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', API_KEY)
      .send(validBody);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('id', 'prod-uuid-123');
    expect(res.body.data).toHaveProperty('sku', 'SKU-001');
    expect(res.body.data).toHaveProperty('name', 'Product A');
    expect(res.body.data).toHaveProperty('price', 10000);
    expect(res.body.data).toHaveProperty('stock', 50);
    expect(res.body.data.category).toEqual({
      id: 'cat-uuid-123',
      name: 'Electronics',
    });
    expect(typeof res.body.data.createdAt).toBe('number');
  });

  it('should return 400 if SKU already exists', async () => {
    const existingProduct = {
      id: 'existing-uuid',
      sku: 'SKU-001',
    };

    jest.spyOn(Product, 'findOne').mockResolvedValue(existingProduct as any);

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', API_KEY)
      .send(validBody);

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('sku');
    expect(res.body.errors.sku).toContain('sku is unique');
  });

  it('should return 400 if request body is empty', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', API_KEY)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('sku');
    expect(res.body.errors).toHaveProperty('name');
    expect(res.body.errors).toHaveProperty('price');
    expect(res.body.errors).toHaveProperty('stock');
    expect(res.body.errors).toHaveProperty('categoryId');
  });

  it('should return 400 if name exceeds 255 characters', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', API_KEY)
      .send({ ...validBody, name: 'a'.repeat(256) });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('name');
    expect(res.body.errors.name).toContain('name length must not more than 255 characters');
  });

  it('should return 400 if price is negative', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', API_KEY)
      .send({ ...validBody, price: -100 });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('price');
    expect(res.body.errors.price).toContain('price must not negative');
  });

  it('should return 400 if stock is negative', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', API_KEY)
      .send({ ...validBody, stock: -5 });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('stock');
    expect(res.body.errors.stock).toContain('stock must not negative');
  });

  it('should return 401 if Authorization header is missing', async () => {
    const res = await request(app)
      .post('/api/products')
      .send(validBody);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Unauthorized');
  });

  it('should return 403 if API Key is invalid', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', 'wrong-key')
      .send(validBody);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('message', 'Forbidden: Invalid API Key');
  });
});
