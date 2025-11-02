describe('Restaurant model define & associate', () => {
  beforeEach(() => jest.resetModules());

  test('defines Restaurant and associates Menu and User', () => {
    const hasMany = jest.fn();
    const belongsTo = jest.fn();
    const defineMock = jest.fn(() => ({ hasMany, belongsTo }));

    jest.doMock('../../src/config/db', () => ({ sequelize: { define: defineMock } }));
    jest.doMock('sequelize', () => ({ DataTypes: { STRING: 'STRING', INTEGER: 'INTEGER', TEXT: 'TEXT' } }));

    const Restaurant = require('../../src/models/Restaurant');

    expect(defineMock).toHaveBeenCalled();
    expect(Restaurant).toHaveProperty('associate');

    Restaurant.associate({ Menu: 'MenuModel', User: 'UserModel' });
    expect(hasMany).toHaveBeenCalledWith('MenuModel', expect.any(Object));
    expect(belongsTo).toHaveBeenCalledWith('UserModel', expect.any(Object));
  });
});
