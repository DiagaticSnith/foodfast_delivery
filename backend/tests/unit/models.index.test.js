describe('models/index wiring', () => {
  beforeEach(() => jest.resetModules());

  test('requires models and calls associate where present', () => {
    // create fake model modules with associate functions
    const makeModel = (name) => {
      const associate = jest.fn();
      return { associate };
    };

    jest.doMock('../../src/models/User', () => makeModel('User'));
    jest.doMock('../../src/models/Cart', () => makeModel('Cart'));
    jest.doMock('../../src/models/Order', () => makeModel('Order'));
    jest.doMock('../../src/models/OrderDetail', () => makeModel('OrderDetail'));
    jest.doMock('../../src/models/Menu', () => makeModel('Menu'));
    jest.doMock('../../src/models/CartItem', () => makeModel('CartItem'));
    jest.doMock('../../src/models/Restaurant', () => makeModel('Restaurant'));
    jest.doMock('../../src/models/Drone', () => makeModel('Drone'));
    jest.doMock('../../src/models/Review', () => makeModel('Review'));

    // mock sequelize instance used in index
    jest.doMock('../../src/config/db', () => ({ sequelize: {} }));

    const db = require('../../src/models');

    // ensure exported keys exist
    expect(db).toHaveProperty('User');
    expect(db).toHaveProperty('Menu');
    expect(db).toHaveProperty('Order');

    // each mocked model should have had its associate called (index triggers it)
    Object.values(db).forEach((m) => {
      if (m && typeof m.associate === 'function') {
        // the mocked associate is a jest.fn, index should have invoked it
        expect(m.associate).toHaveBeenCalled();
      }
    });
  });
});
