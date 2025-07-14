const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
let app;

beforeAll(async () => {
  const mongo = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongo.getUri();
  app = require('../app');
});
afterAll(async () => { await mongoose.disconnect(); });

describe('Integration Order API', () => {
  const token = require('jsonwebtoken').sign({ role:'user' }, process.env.JWT_SECRET);
  it('should list empty orders', async () => {
    const res = await request(app).get('/api/orders')
      .set('Authorization','Bearer '+token);
    expect(res.body.data).toBeInstanceOf(Array);
  });
  it('should create then get order', async () => {
    const create = await request(app).post('/api/orders')
      .set('Authorization','Bearer '+token)
      .send({ customerId:'c1', products:[{productId:'p1',quantity:2}] });
    expect(create.statusCode).toBe(201);
    const id = create.body._id;
    const get = await request(app).get(`/api/orders/${id}`)
      .set('Authorization','Bearer '+token);
    expect(get.statusCode).toBe(200);
    expect(get.body.customerId).toBe('c1');
  });
});
