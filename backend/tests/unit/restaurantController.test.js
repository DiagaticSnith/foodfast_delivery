// Mock the models module that restaurantController imports
const mockFindAll = jest.fn();
const mockFindByPk = jest.fn();
const mockCreate = jest.fn();

jest.mock('../../src/models', () => ({
  Restaurant: {
    findAll: (...args) => mockFindAll(...args),
    findByPk: (...args) => mockFindByPk(...args),
    create: (...args) => mockCreate(...args),
  },
  Menu: {},
}));

const controller = require('../../src/controllers/restaurantController');

describe('restaurantController', () => {
  beforeEach(() => jest.resetAllMocks());

  test('getAll defaults to active status and returns results', async () => {
    mockFindAll.mockResolvedValueOnce([{ id: 1, name: 'R' }]);
    const req = { query: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await controller.getAll(req, res);

    expect(mockFindAll).toHaveBeenCalledWith(expect.objectContaining({ where: { status: 'active' } }));
    expect(res.json).toHaveBeenCalledWith([{ id: 1, name: 'R' }]);
  });

  test('getById returns 404 when not found', async () => {
    mockFindByPk.mockResolvedValueOnce(null);
    const req = { params: { id: 5 }, query: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await controller.getById(req, res);

    expect(mockFindByPk).toHaveBeenCalledWith(5, expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Not found' });
  });

  test('create sets pending when userId present', async () => {
    mockCreate.mockResolvedValueOnce({ id: 7, status: 'pending' });
    const req = { body: { name: 'New', userId: 2 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await controller.create(req, res);

    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ status: 'pending', name: 'New' }));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 7, status: 'pending' });
  });

  test('update returns 404 when not found', async () => {
    mockFindByPk.mockResolvedValueOnce(null);
    const req = { params: { id: 8 }, body: { name: 'X' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await controller.update(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Not found' });
  });

  test('delete hides restaurant when found', async () => {
    const fakeRestaurant = { update: jest.fn().mockResolvedValueOnce({}), id: 9 };
    mockFindByPk.mockResolvedValueOnce(fakeRestaurant);
    const req = { params: { id: 9 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await controller.delete(req, res);

    expect(fakeRestaurant.update).toHaveBeenCalledWith({ status: 'hidden' });
    expect(res.json).toHaveBeenCalledWith({ message: 'Hidden' });
  });
});
