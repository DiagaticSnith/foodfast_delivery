const request = require('supertest');
const express = require('express');

describe('integration: menu endpoints', () => {
  beforeEach(() => jest.resetModules());

  test('GET /menus and GET /menu/:id not found', async () => {
    const findAll = jest.fn().mockResolvedValue([{ id: 1, name: 'm1' }]);
    const Menu = { findAll, findByPk: jest.fn().mockResolvedValue(null) };
    jest.doMock('../../src/models/Menu', () => Menu);
    jest.doMock('../../src/models', () => ({ Menu }));

    const mc = require('../../src/controllers/menuController');
    const app = express();
    app.get('/menus', mc.getMenus);
    app.get('/menu/:id', mc.getMenuDetail);

    const res = await request(app).get('/menus').expect(200);
    expect(res.body).toEqual(expect.any(Array));
    await request(app).get('/menu/1').expect(404);
  });

  test('POST/PUT/DELETE menu', async () => {
    const create = jest.fn().mockResolvedValue({ id: 2 });
    const update = jest.fn().mockResolvedValue({ id: 2 });
    const menuObj = { id: 2, update };
    const findByPk = jest.fn().mockResolvedValue(menuObj);
    const Menu = { create, findByPk };
    jest.doMock('../../src/models/Menu', () => Menu);
    jest.doMock('../../src/models', () => ({ Menu }));

    const mc = require('../../src/controllers/menuController');
    const app = express();
    app.use(express.json());
    app.post('/menu', mc.createMenu);
    app.put('/menu/:id', mc.updateMenu);
    app.delete('/menu/:id', mc.deleteMenu);

    await request(app).post('/menu').send({ name: 'x' }).expect(201);
    await request(app).put('/menu/2').send({ name: 'y' }).expect(200);
    await request(app).delete('/menu/2').expect(200);
  });
});
