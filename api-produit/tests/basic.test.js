const request = require('supertest');
const app = require('../src/server');

describe('Gestion Produits API', () => {
  it('GET /health → 200 & status OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'OK' });
  });

  it('GET /api/produits → 200 & array', async () => {
    const res = await request(app).get('/api/produits');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

    it('GET /api/produits/:id → récupère un produit existant', async () => {
    // Crée un produit de test
    const postRes = await request(app)
      .post('/api/produits')
      .send({ nom: 'Test', description: 'Desc', prix: 5, stock: 2 });

    const { _id } = postRes.body;
    const getRes = await request(app).get(`/api/produits/${_id}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body).toMatchObject({
      _id,
      nom: 'Test',
      description: 'Desc',
      prix: 5,
      stock: 2
    });
  });
});