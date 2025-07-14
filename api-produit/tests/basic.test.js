const request = require('supertest');
const app = require('../src/server');
/*const path    = require('path');*/

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


/*describe('PUT /api/produits/:id/image', () => {
  let produitId;

  beforeAll(async () => {
    // Créer un produit de test en mémoire
    const res = await request(app)
      .post('/api/produits')
      .send({ nom: 'Test', prix: 10 });
    produitId = res.body._id;
  });

  it('devrait remplacer l’image du produit', async () => {
    const res = await request(app)
      .put(`/api/produits/${produitId}/image`)
      .attach('image', path.join(__dirname, 'fixtures', 'photo.jpg'));

    expect(res.status).toBe(200);
    expect(res.body.imagePath).toMatch(/\/uploads\/\d+-photo\.jpg$/);
  });

  it('retourne 404 si produit introuvable', async () => {
    const res = await request(app)
      .put('/api/produits/507f191e810c19729de860ea/image')
      .attach('image', path.join(__dirname, 'fixtures', 'photo.jpg'));

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Produit non trouvé');
  });

  it('retourne 400 si pas d’image fournie', async () => {
    const res = await request(app)
      .put(`/api/produits/${produitId}/image`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Aucune image uploadée');
  });
});*/