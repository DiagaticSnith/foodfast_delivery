describe('CartItem model define & top-level belongsTo', () => {
  beforeEach(() => jest.resetModules());

  test('defines CartItem and calls belongsTo with Menu', () => {
    const belongsTo = jest.fn();
    const defineMock = jest.fn(() => ({ belongsTo }));

    // mock Menu module which CartItem requires at top-level
    jest.doMock('../../src/models/Menu', () => 'MenuModel');
    jest.doMock('../../src/config/db', () => ({ sequelize: { define: defineMock } }));
    jest.doMock('sequelize', () => ({ DataTypes: { INTEGER: 'INTEGER' } }));

    const CartItem = require('../../src/models/CartItem');

    expect(defineMock).toHaveBeenCalled();
    // when the module executed, it should have called belongsTo(Menu,...)
    expect(belongsTo).toHaveBeenCalledWith('MenuModel', expect.any(Object));
  });
});
