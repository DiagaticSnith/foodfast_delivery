describe('Order model define & associate', () => {
  beforeEach(() => jest.resetModules());

  test('defines Order and sets up associations', () => {
    const belongsTo = jest.fn();
    const hasMany = jest.fn();
    const defineMock = jest.fn(() => ({ belongsTo, hasMany }));

    jest.doMock('../../src/config/db', () => ({ sequelize: { define: defineMock } }));
    jest.doMock('sequelize', () => ({ DataTypes: { INTEGER: 'INTEGER', FLOAT: 'FLOAT', STRING: 'STRING', TEXT: 'TEXT' } }));

    const Order = require('../../src/models/Order');

    expect(defineMock).toHaveBeenCalled();
    expect(Order).toHaveProperty('associate');

    Order.associate({ User: 'UserModel', Drone: 'DroneModel', OrderDetail: 'OrderDetailModel' });

    expect(belongsTo).toHaveBeenCalledWith('UserModel', expect.any(Object));
    expect(belongsTo).toHaveBeenCalledWith('DroneModel', expect.any(Object));
    expect(hasMany).toHaveBeenCalledWith('OrderDetailModel', expect.any(Object));
  });
});
