const request = require('supertest');
const express = require('express');

describe('integration: user endpoints', () => {
  beforeEach(() => jest.resetModules());

  test('GET /user/:id not found and found', async () => {
    const findByPk = jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 7, username: 'u7' });
    jest.doMock('../../src/models/User', () => ({ findByPk }));

    const userController = require('../../src/controllers/userController');
    const app = express();
    app.get('/user/:id', userController.getUserById);

    await request(app).get('/user/1').expect(404);
    const res = await request(app).get('/user/2').expect(200);
    expect(res.body).toHaveProperty('id', 7);
  });

  test('PUT update info 404 and success', async () => {
    const saveMock = jest.fn();
    const userObj = { id: 8, username: 'u8', save: saveMock, toJSON: () => ({ id: 8 }) };
    const findByPk = jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(userObj);
    jest.doMock('../../src/models/User', () => ({ findByPk }));

    const userController = require('../../src/controllers/userController');
    const app = express();
    app.use(express.json());
    app.put('/user/:id', userController.updateUserInfo);

    await request(app).put('/user/1').send({ name: 'X' }).expect(404);
    await request(app).put('/user/2').send({ name: 'Y' }).expect(200);
    expect(saveMock).toHaveBeenCalled();
  });
});
