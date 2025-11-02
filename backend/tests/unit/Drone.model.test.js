describe('Drone model define & associate', () => {
  beforeEach(() => jest.resetModules());

  test('defines Drone and hasMany Order', () => {
    const hasMany = jest.fn();
    const defineMock = jest.fn(() => ({ hasMany }));

    jest.doMock('../../src/config/db', () => ({ sequelize: { define: defineMock } }));
    jest.doMock('sequelize', () => ({ DataTypes: { INTEGER: 'INTEGER', STRING: 'STRING' } }));

    const Drone = require('../../src/models/Drone');

    expect(defineMock).toHaveBeenCalled();
    expect(Drone).toHaveProperty('associate');

    Drone.associate({ Order: 'OrderModel' });
    expect(hasMany).toHaveBeenCalledWith('OrderModel', expect.any(Object));
  });
});
