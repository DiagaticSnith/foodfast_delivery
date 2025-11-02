describe('Menu model define & associate', () => {
  beforeEach(() => jest.resetModules());

  test('defines Menu and belongsTo Restaurant', () => {
    const belongsTo = jest.fn();
    const defineMock = jest.fn(() => ({ belongsTo }));

    jest.doMock('../../src/config/db', () => ({ sequelize: { define: defineMock } }));
    jest.doMock('sequelize', () => ({ DataTypes: { STRING: 'STRING', FLOAT: 'FLOAT', BOOLEAN: 'BOOLEAN' } }));

    const Menu = require('../../src/models/Menu');

    expect(defineMock).toHaveBeenCalled();
    expect(Menu).toHaveProperty('associate');

    Menu.associate({ Restaurant: 'RestaurantModel' });
    expect(belongsTo).toHaveBeenCalledWith('RestaurantModel', expect.any(Object));
  });
});
