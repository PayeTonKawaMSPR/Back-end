const request = require('supertest');
const app = require('../src/server');
const path = require('path');

describe('Endpoints d’upload d’image', () => {
  let prodId;
  beforeAll(async () => {
    const res = await request(app)
      .post('/api/produits')
      .send({ nom:'ImgTest', prix:1, description:'Demo description', Stock: 11 });
    prodId = res.body._id;
  });

  it('should upload image', async () => {
    const res = await request(app)
      .put(`/api/produits/${prodId}/image`)
      .attach('image', path.join(__dirname, 'fixtures', 'photo.webp'));
    expect(res.statusCode).toBe(200);
    expect(res.body.imagePath).toMatch(/uploads\//);
  });

  it('should return 400 if no file', async () => {
    const res = await request(app).put(`/api/produits/${prodId}/image`);
    expect(res.statusCode).toBe(400);
  });

  it('should return 404 for nonexistent product', async () => {
    const res = await request(app)
      .put('/api/produits/507f191e810c19729de860ea/image')
      .attach('image', path.join(__dirname, '../fixtures/photo.jpg'));
    expect(res.statusCode).toBe(404);
  });
});