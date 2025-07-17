const request = require('supertest');
const app = require('../app');

describe("GET /api/orders", () => {
  it("devrait retourner un code 200", async () => {
    const res = await request(app).get('/api/orders');
    expect(res.statusCode).toBe(200);
  });
});
