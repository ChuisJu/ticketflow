'use strict';

const request = require('supertest');
const buildApp = require('../src/app');

const app = buildApp();

describe('TicketFlow API', () => {
  test('GET /health renvoie ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.statut).toBe('ok');
  });

  test('GET /tickets sans identité renvoie 401', async () => {
    const res = await request(app).get('/tickets');
    expect(res.status).toBe(401);
  });

  test('un agent ne voit que ses propres tickets', async () => {
    const res = await request(app).get('/tickets').set('x-agent-id', 'agent1');
    expect(res.status).toBe(200);
    expect(res.body.every((t) => t.agent === 'agent1')).toBe(true);
  });

  test('le superviseur voit tous les tickets', async () => {
    const res = await request(app)
      .get('/tickets')
      .set('x-agent-id', 'sup1')
      .set('x-role', 'superviseur');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(3);
  });

  test('accès refusé (403) à un ticket d\'un autre agent', async () => {
    // Le ticket 2 appartient à agent2 ; agent1 ne doit pas y accéder.
    const res = await request(app).get('/tickets/2').set('x-agent-id', 'agent1');
    expect(res.status).toBe(403);
  });

  test('création d\'un ticket valide renvoie 201', async () => {
    const res = await request(app)
      .post('/tickets')
      .set('x-agent-id', 'agent1')
      .send({ sujet: 'Test', client: 'dave' });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeGreaterThan(0);
    expect(res.body.agent).toBe('agent1');
  });

  test('création sans sujet renvoie 400', async () => {
    const res = await request(app)
      .post('/tickets')
      .set('x-agent-id', 'agent1')
      .send({ client: 'dave' });
    expect(res.status).toBe(400);
  });
});
