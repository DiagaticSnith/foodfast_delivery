const request = require('supertest');
const express = require('express');

describe('integration: drone endpoints (deprecated)', () => {
  beforeEach(() => jest.resetModules());

  test('assignDrone and assignShipper return 410', async () => {
    const oc = require('../../src/controllers/orderController');
    const app = express();
    app.use(express.json());
    app.post('/assignDrone', oc.assignDrone);
    app.post('/assignShipper', oc.assignShipper);

    await request(app).post('/assignDrone').expect(410);
    await request(app).post('/assignShipper').expect(410);
  });
});
