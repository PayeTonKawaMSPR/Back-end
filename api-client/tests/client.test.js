process.env.NODE_ENV = 'test';
require('dotenv').config({ path: '.env.test' });
jest.setTimeout(20000); // 20 secondes

const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');

let token;
let clientId;

beforeAll(async () => {
  // Tente d'abord de se connecter
  let res = await request(app)
    .post('/auth/login')
    .send({
      email: 'roseline@example.com',
      password: '123456'
    });

  // Si échec, créer l'utilisateur (signup)
  if (!res.body.token) {
    await request(app)
      .post('/auth/signup')
      .send({
        name: 'Roseline Test',
        email: 'roseline@example.com',
        password: '123456'
      });

    res = await request(app)
      .post('/auth/login')
      .send({
        email: 'roseline@example.com',
        password: '123456'
      });
  }

  // Vérifie la récupération du token
  if (!res.body.token) {
    throw new Error("Échec de récupération du token même après inscription.");
  }

  token = res.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Client API', () => {
  it('GET /clients → devrait retourner tous les clients', async () => {
    const res = await request(app)
      .get('/clients')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /clients → devrait créer un client', async () => {
    const res = await request(app)
      .post('/clients')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Client Test',
        email: 'clienttest@example.com',
        password: 'azerty',
        phone: '0600000000',
        address: '1 rue Test'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('client');
    clientId = res.body.client._id;
  });

  it('GET /clients/:id → devrait retourner un client spécifique', async () => {
    const res = await request(app)
      .get(`/clients/${clientId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id', clientId);
  });

  it('PUT /clients/:id → devrait modifier un client', async () => {
    const res = await request(app)
      .put(`/clients/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Client Modifié', phone: '0600112233' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'Client Modifié');
  });

  it('DELETE /clients/:id → devrait supprimer un client', async () => {
    const res = await request(app)
      .delete(`/clients/${clientId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Client supprimé avec succès');
  });
});
