describe('OrderDetail model define & top-level belongsTo', () => {
  beforeEach(() => jest.resetModules());

  test('defines OrderDetail and sets up belongsTo relations', () => {
    const belongsTo = jest.fn();
    const defineMock = jest.fn(() => ({ belongsTo }));

    // mock modules Order and Menu that are required at top-level
    jest.doMock('../../src/models/Order', () => 'OrderModel');
    jest.doMock('../../src/models/Menu', () => 'MenuModel');
    jest.doMock('../../src/config/db', () => ({ sequelize: { define: defineMock } }));
    jest.doMock('sequelize', () => ({ DataTypes: { INTEGER: 'INTEGER', FLOAT: 'FLOAT' } }));

    const OrderDetail = require('../../src/models/OrderDetail');

    expect(defineMock).toHaveBeenCalled();
    // top-level code calls belongsTo(Order) and belongsTo(Menu)
    expect(belongsTo).toHaveBeenCalledWith('OrderModel', expect.any(Object));
    expect(belongsTo).toHaveBeenCalledWith('MenuModel', expect.any(Object));
  });
});
