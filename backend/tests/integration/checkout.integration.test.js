const request = require('supertest');
const express = require('express');

describe('integration: checkout & payment', () => {
  beforeEach(() => jest.resetModules());

  test('POST /payment intent returns clientSecret', async () => {
    // stripe mock is provided in jest.setup.js globally
    const pc = require('../../src/controllers/paymentController');
    const app = express();
    app.use(express.json());
    app.post('/payment', pc.createPaymentIntent);

    const res = await request(app).post('/payment').send({ amount: 12.5 }).expect(200);
    expect(res.body).toHaveProperty('clientSecret');
  });

  test('GET /checkout/success handler', async () => {
    const Order = { create: jest.fn().mockResolvedValue({ id: 99 }) };
    const OrderDetail = { create: jest.fn().mockResolvedValue({}) };
    const Menu = { findOne: jest.fn().mockResolvedValue({ id: 7 }) };
    jest.doMock('../../src/models/Order', () => ({ Order }));
    jest.doMock('../../src/models/OrderDetail', () => ({ OrderDetail }));
    jest.doMock('../../src/models/Menu', () => ({ Menu }));

    const csc = require('../../src/controllers/checkoutSuccessController');
    const app = express();
    app.get('/checkout/success', csc.handleCheckoutSuccess);

    const res = await request(app).get('/checkout/success').query({ session_id: 'sess_1' }).expect(200);
    expect(res.body).toHaveProperty('orderId');
  });
});
