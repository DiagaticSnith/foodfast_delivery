describe('User model define & associate', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('calls sequelize.define and exports model with associate', () => {
    const hasOne = jest.fn();
    const hasMany = jest.fn();
    const defineMock = jest.fn(() => ({ hasOne, hasMany }));

    jest.doMock('../../src/config/db', () => ({ sequelize: { define: defineMock } }));
    jest.doMock('sequelize', () => ({ DataTypes: { STRING: 'STRING', ENUM: () => 'ENUM' } }));

    const User = require('../../src/models/User');

    expect(defineMock).toHaveBeenCalled();
    expect(User).toHaveProperty('associate');

    // call associate and verify relationships are created
    User.associate({ Cart: 'CartModel', Order: 'OrderModel' });
    expect(hasOne).toHaveBeenCalledWith('CartModel', { foreignKey: 'userId' });
    expect(hasMany).toHaveBeenCalledWith('OrderModel', { foreignKey: 'userId' });
  });
});
