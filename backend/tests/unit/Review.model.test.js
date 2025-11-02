describe('Review model define & associate', () => {
  beforeEach(() => jest.resetModules());

  test('defines Review and sets up associations', () => {
    const belongsTo = jest.fn();
    const defineMock = jest.fn(() => ({ belongsTo }));

    jest.doMock('../../src/config/db', () => ({ sequelize: { define: defineMock } }));
    jest.doMock('sequelize', () => ({ DataTypes: { INTEGER: 'INTEGER', TEXT: 'TEXT', ENUM: () => 'ENUM' } }));

    const Review = require('../../src/models/Review');

    expect(defineMock).toHaveBeenCalled();
    expect(Review).toHaveProperty('associate');

    Review.associate({ User: 'UserModel', Menu: 'MenuModel' });
    expect(belongsTo).toHaveBeenCalledWith('UserModel', expect.any(Object));
    expect(belongsTo).toHaveBeenCalledWith('MenuModel', expect.any(Object));
  });
});
