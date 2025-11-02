describe('Cart model define & associate', () => {
  beforeEach(() => jest.resetModules());

  test('defines Cart and sets belongsTo and hasMany', () => {
    const belongsTo = jest.fn();
    const hasMany = jest.fn();
    const defineMock = jest.fn(() => ({ belongsTo, hasMany }));

    jest.doMock('../../src/config/db', () => ({ sequelize: { define: defineMock } }));
    jest.doMock('sequelize', () => ({ DataTypes: { INTEGER: 'INTEGER' } }));

    const Cart = require('../../src/models/Cart');

    expect(defineMock).toHaveBeenCalled();
    expect(Cart).toHaveProperty('associate');

    Cart.associate({ User: 'UserModel', CartItem: 'CartItemModel' });
    expect(belongsTo).toHaveBeenCalledWith('UserModel', expect.any(Object));
    expect(hasMany).toHaveBeenCalledWith('CartItemModel', expect.any(Object));
  });
});
