const request = require('supertest');
const express = require('express');

describe('integration: mounted controllers', () => {
  beforeEach(() => jest.resetModules());

  test('POST /register -> userController.register (success & validation)', async () => {
    // Mock User model used by userController
    const fakeUser = { id: 3, username: 'u1', name: 'Name', email: 'a@b.com', role: 'user' };
    const findOne = jest.fn().mockResolvedValue(null);
    const create = jest.fn().mockResolvedValue(fakeUser);
    jest.doMock('../../src/models/User', () => ({ findOne, create }));

    const userController = require('../../src/controllers/userController');
    const app = express();
    app.use(express.json());
    app.post('/register', userController.register);

    // missing fields
    await request(app).post('/register').send({ username: '', password: '', email: '' }).expect(400);

    // success
    const res = await request(app).post('/register').send({ username: 'u1', password: 'pass', email: 'a@b.com', name: 'Name' }).expect(201);
    expect(res.body).toMatchObject({ id: fakeUser.id, username: fakeUser.username });
    expect(findOne).toHaveBeenCalled();
    expect(create).toHaveBeenCalled();
  });

  test('POST /orders -> orderController.createOrder (with items and without items)', async () => {
    const createdOrder = { id: 10, userId: 1, total: 20, address: 'x', status: 'Pending' };
    const Order = { create: jest.fn().mockResolvedValue(createdOrder) };
    const OrderDetail = { create: jest.fn().mockResolvedValue({}) };
    jest.doMock('../../src/models', () => ({ Order, OrderDetail }));

    const orderController = require('../../src/controllers/orderController');
    const app = express();
    app.use(express.json());
    app.post('/orders', orderController.createOrder);

    // without items
    const res1 = await request(app).post('/orders').send({ userId: 1, total: 5, address: 'a' }).expect(201);
    expect(Order.create).toHaveBeenCalled();

    // with items
    Order.create.mockClear();
    const res2 = await request(app).post('/orders').send({ userId: 1, total: 10, address: 'a', items: [{ menuId: 2, quantity: 1, price: 10 }] }).expect(201);
    expect(Order.create).toHaveBeenCalled();
    expect(OrderDetail.create).toHaveBeenCalled();
  });

  test('POST /checkout -> stripeController.createCheckoutSession', async () => {
    // Use global stripe mock from setup; mount controller
    const stripeController = require('../../src/controllers/stripeController');
    const app = express();
    app.use(express.json());
    app.post('/checkout', stripeController.createCheckoutSession);

    const res = await request(app).post('/checkout').send({ cartItems: [{ name: 'a', price: 1, quantity: 1 }], address: 'x', userId: 1, email: 'a@b.com' }).expect(200);
    expect(res.body).toHaveProperty('sessionId');
    expect(res.body).toHaveProperty('url');
  });
});
