const request = require('supertest');
const express = require('express');

describe('integration: restaurant endpoints', () => {
  beforeEach(() => jest.resetModules());

  test('GET /restaurants returns list', async () => {
    const findAll = jest.fn().mockResolvedValue([{ id: 1 }]);
    const Restaurant = { findAll, findByPk: jest.fn().mockResolvedValue(null), create: jest.fn().mockResolvedValue({ id: 3 }) };
    jest.doMock('../../src/models', () => ({ Restaurant }));

    const rc = require('../../src/controllers/restaurantController');
    const app = express();
    app.get('/restaurants', rc.getAll);

    const res = await request(app).get('/restaurants').expect(200);
    expect(res.body).toEqual(expect.any(Array));
  });

  test('CRUD flows', async () => {
  const fakeRestaurant = { id: 4, update: jest.fn().mockResolvedValue({}), toJSON: () => ({ id: 4 }) };
  const Restaurant = { findByPk: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(fakeRestaurant).mockResolvedValueOnce(fakeRestaurant), create: jest.fn().mockResolvedValue(fakeRestaurant) };
    jest.doMock('../../src/models', () => ({ Restaurant }));

    const rc = require('../../src/controllers/restaurantController');
    const app = express();
    app.use(express.json());
    app.post('/restaurants', rc.create);
    app.put('/restaurants/:id', rc.update);
    app.delete('/restaurants/:id', rc.delete);

    await request(app).post('/restaurants').send({ name: 'R', address: 'A' }).expect(201);
    await request(app).put('/restaurants/5').send({ name: 'N' }).expect(404);
    await request(app).put('/restaurants/5').send({ name: 'N' }).expect(200);
    await request(app).delete('/restaurants/5').expect(200);
  });
});
