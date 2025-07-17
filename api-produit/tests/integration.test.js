const request = require('supertest');
const app = require('../src/server');

/*describe('API integration', () => {
  it('GET /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });

  it('CRUD produits', async () => {
    // Create
    const post = await request(app).post('/api/produits').send({ nom:'IntTest', prix:2, description:'D', Stock:1 });
    expect(post.status).toBe(201);
    const id = post.body._id;

    // Read
    const get = await request(app).get(`/api/produits/${id}`);
    expect(get.status).toBe(200);

    // Update
    const put = await request(app).put(`/api/produits/${id}`).send({ prix:3, nom:'IntTest' });
    expect(put.status).toBe(200);
    expect(put.body.prix).toBe(3);

    // Delete
    const del = await request(app).delete(`/api/produits/${id}`);
    expect(del.status).toBe(200);
  });
});*/

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
      .send({ nom: 'Test', description: 'Desc', prix: 5, Stock: 2 });

    const { _id } = postRes.body;
    const getRes = await request(app).get(`/api/produits/${_id}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body).toMatchObject({
      _id,
      nom: 'Test',
      description: 'Desc',
      prix: 5,
      Stock: 2
    });
  });
});

describe('GET /api/produits/:id', () => {
  it('renvoie 404 si l\'ID est invalide ou inexistant', async () => {
    const res = await request(app).get('/api/produits/507f191e810c19729de860ea');
    expect(res.statusCode).toBe(404);
  });
});

describe('PUT /api/produits/:id', () => {
  it('met à jour un produit avec succès', async () => {
    const produit = await request(app).post('/api/produits').send({
      nom: 'ProduitPUT',
      prix: 10,
      description: 'desc',
      Stock: 2
    });
    const res = await request(app).put(`/api/produits/${produit.body._id}`).send({
      nom: 'ProduitPUT', // doit être identique pour éviter le conflit unique
      prix: 12
    });
    expect(res.status).toBe(200);
    expect(res.body.prix).toBe(12);
  });

  it('retourne 409 si le nom du produit est déjà pris par un autre', async () => {
    const p1 = await request(app).post('/api/produits').send({
      nom: 'NomUnique',
      prix: 1,
      description: 'A',
      Stock: 1
    });
    const p2 = await request(app).post('/api/produits').send({
      nom: 'NomÀChanger',
      prix: 2,
      description: 'B',
      Stock: 2
    });
    const res = await request(app).put(`/api/produits/${p2.body._id}`).send({
      nom: 'NomUnique'
    });
    expect(res.status).toBe(409);
  });
});

describe('PATCH /api/produits/:id', () => {
  it('modifie partiellement un produit', async () => {
    const produit = await request(app).post('/api/produits').send({
      nom: 'PatchTest',
      prix: 5,
      description: 'test',
      Stock: 3
    });
    const res = await request(app)
      .patch(`/api/produits/${produit.body._id}`)
      .send({ prix: 8 });
    expect(res.status).toBe(200);
    expect(res.body.prix).toBe(8);
  });
});

describe('DELETE /api/produits/:id', () => {
  it('supprime un produit existant', async () => {
    const produit = await request(app).post('/api/produits').send({
      nom: 'DeleteTest',
      prix: 1,
      description: 'D',
      Stock: 1
    });
    const res = await request(app).delete(`/api/produits/${produit.body._id}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Produit supprimé');
  });

  it('retourne 500 si suppression échoue', async () => {
    // Simule un mauvais ID pour forcer une erreur
    const res = await request(app).delete('/api/produits/invalide');
    expect(res.statusCode).toBe(400); // ou 500 si pas attrapé proprement
  });
});
