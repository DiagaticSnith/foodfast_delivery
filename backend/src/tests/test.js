const { describe, it, expect, jest } = require('@jest/globals');
const { getMenus, createMenu } = require('../controllers/menuController');
const { Menu } = require('../models/Menu');

describe('Menu Controller', () => {
  it('should get menus', async () => {
    const mockMenus = [{ id: 1, name: 'Pizza' }];
    jest.spyOn(Menu, 'findAll').mockResolvedValue(mockMenus);
    const req = { query: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    await getMenus(req, res);
    expect(res.json).toHaveBeenCalledWith(mockMenus);
  });
});