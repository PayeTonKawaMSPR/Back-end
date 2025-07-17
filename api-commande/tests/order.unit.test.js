const request = require('supertest');
const app = require('../app');
const Order = require('../models/order');
const { publish } = require('../rabbitmq');
jest.mock('../models/order');
jest.mock('../rabbitmq');

describe('Unit Order Routes', () => {
  it('POST /api/orders - success', async () => {
    Order.create.mockResolvedValue({ _id:'1', customerId:'c', products:[{productId:'p',quantity:1}] });
    const res = await request(app).post('/api/orders')
      .set('Authorization','Bearer token')
      .send({ customerId:'c', products:[{productId:'p',quantity:1}] });
    expect(res.statusCode).toBe(201);
    expect(publish).toBeCalled();
  });
  it('POST /api/orders - validation error', async () => {
    const res = await request(app).post('/api/orders')
      .set('Authorization','Bearer token')
      .send({ customerId:'', products:[] });
    expect(res.statusCode).toBe(400);
  });
  it('GET /api/orders - invalid query', async () => {
    const res = await request(app).get('/api/orders?page=0&limit=0')
      .set('Authorization','Bearer token');
    expect(res.statusCode).toBe(400);
  });
  it('GET /api/orders/:id - not found', async () => {
    Order.findById.mockResolvedValue(null);
    const res = await request(app).get('/api/orders/507f191e810c19729de860ea')
      .set('Authorization','Bearer token');
    expect(res.statusCode).toBe(404);
  });
});