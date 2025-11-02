jest.mock('../../src/models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const User = require('../../src/models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { register, login, getShippersAndPending, updateUserInfo, updateUserRole, getAllUsers, getUserById } = require('../../src/controllers/userController');

describe('userController - register & login', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('register - success', async () => {
    const req = { body: { username: 'u1', password: 'p1', email: 'a@b.com', name: 'Name' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    User.findOne = jest.fn()
      // first call: check username -> null
      .mockResolvedValueOnce(null)
      // second call: check email -> null
      .mockResolvedValueOnce(null);
    bcrypt.hash.mockResolvedValue('hashed');
    User.create = jest.fn().mockResolvedValue({ id: 10, username: 'u1', name: 'Name', email: 'a@b.com', role: 'user' });

    await register(req, res);

    expect(User.findOne).toHaveBeenCalledTimes(2);
    expect(bcrypt.hash).toHaveBeenCalledWith('p1', 10);
    expect(User.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 10, username: 'u1' }));
  });

  test('register - duplicate username', async () => {
    const req = { body: { username: 'u1', password: 'p1', email: 'a@b.com' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    User.findOne = jest.fn().mockResolvedValueOnce({ id: 1, username: 'u1' });

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Tên đăng nhập đã được sử dụng' });
  });

  test('login - success', async () => {
    const req = { body: { username: 'u1', password: 'p1' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    const fakeUser = { id: 5, username: 'u1', password: 'hashedpw', role: 'user', name: 'N' };
    User.findOne = jest.fn().mockResolvedValue(fakeUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('tok');

    await login(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ where: { username: 'u1' } });
    expect(bcrypt.compare).toHaveBeenCalledWith('p1', 'hashedpw');
    expect(jwt.sign).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Login success', token: 'tok' }));
  });

  test('login - invalid credentials', async () => {
    const req = { body: { username: 'u1', password: 'p1' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    User.findOne = jest.fn().mockResolvedValue(null);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
  });

  test('register - missing fields', async () => {
    const req = { body: { username: '', password: '', email: '' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Vui lòng nhập đầy đủ username, email và password' });
  });

  test('register - duplicate email', async () => {
    const req = { body: { username: 'u2', password: 'p2', email: 'a@b.com' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    // first call checks username -> null, second checks email -> exists
    User.findOne = jest.fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 2, email: 'a@b.com' });

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email đã được sử dụng' });
  });

  test('register - sequelize unique constraint error', async () => {
    const req = { body: { username: 'u3', password: 'p3', email: 'x@y.com' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    User.findOne = jest.fn().mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashed');
    User.create = jest.fn().mockRejectedValue({ name: 'SequelizeUniqueConstraintError' });

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Tài khoản đã tồn tại' });
  });

  test('login - wrong password (user exists but wrong pw)', async () => {
    const req = { body: { username: 'u1', password: 'wrong' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    const fakeUser = { id: 6, username: 'u1', password: 'hashedpw' };
    User.findOne = jest.fn().mockResolvedValue(fakeUser);
    bcrypt.compare.mockResolvedValue(false);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
  });

  test('getShippersAndPending - returns list', async () => {
    const req = {};
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    User.findAll = jest.fn().mockResolvedValue([{ id: 1, role: 'shipper' }]);

    await getShippersAndPending(req, res);

    expect(User.findAll).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith([{ id: 1, role: 'shipper' }]);
  });

  test('getUserById - not found -> 404', async () => {
    const req = { params: { id: 9 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    User.findByPk = jest.fn().mockResolvedValue(null);

    await getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  test('getUserById - success', async () => {
    const req = { params: { id: 5 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    User.findByPk = jest.fn().mockResolvedValue({ id: 5, username: 'u5' });

    await getUserById(req, res);

    expect(res.json).toHaveBeenCalledWith({ id: 5, username: 'u5' });
  });

  test('getAllUsers - returns users', async () => {
    const req = {};
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    User.findAll = jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]);

    await getAllUsers(req, res);

    expect(res.json).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
  });

  test('updateUserInfo - user not found -> 404', async () => {
    const req = { params: { id: 11 }, body: { name: 'A' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    User.findByPk = jest.fn().mockResolvedValue(null);

    await updateUserInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  test('updateUserInfo - success updates fields', async () => {
    const req = { params: { id: 12 }, body: { name: 'New', address: 'Addr' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    const user = { id: 12, username: 'u12', name: 'Old', email: 'e', address: null, phoneNumber: null, role: 'user', save: jest.fn().mockResolvedValue() };
    User.findByPk = jest.fn().mockResolvedValue(user);

    await updateUserInfo(req, res);

    expect(user.name).toBe('New');
    expect(user.address).toBe('Addr');
    expect(user.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'User info updated' }));
  });

  test('updateUserRole - invalid role returns 400', async () => {
    const req = { params: { id: 13 }, body: { role: 'invalid' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    const user = { id: 13, username: 'u13', save: jest.fn() };
    User.findByPk = jest.fn().mockResolvedValue(user);

    await updateUserRole(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid role' });
  });

  test('updateUserRole - success change to restaurant', async () => {
    const req = { params: { id: 14 }, body: { role: 'restaurant' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    const user = { id: 14, username: 'u14', email: 'e', address: null, phoneNumber: null, role: 'user', save: jest.fn().mockResolvedValue() };
    User.findByPk = jest.fn().mockResolvedValue(user);

    await updateUserRole(req, res);

    expect(user.role).toBe('restaurant');
    expect(user.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Role updated' }));
  });

  // --- Error / catch branches to increase coverage ---
  test('getShippersAndPending - error -> 500', async () => {
    const req = {};
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    User.findAll = jest.fn().mockRejectedValue(new Error('db fail'));

    await getShippersAndPending(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'db fail' });
  });

  test('getAllUsers - error -> 500', async () => {
    const req = {};
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    User.findAll = jest.fn().mockRejectedValue(new Error('oops'));

    await getAllUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'oops' });
  });

  test('updateUserInfo - save throws -> 400', async () => {
    const req = { params: { id: 20 }, body: { name: 'X' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    const user = { id: 20, username: 'u20', save: jest.fn().mockRejectedValue(new Error('save fail')) };
    User.findByPk = jest.fn().mockResolvedValue(user);

    await updateUserInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'save fail' });
  });

  test('updateUserRole - save throws -> 400', async () => {
    const req = { params: { id: 21 }, body: { role: 'user' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    const user = { id: 21, username: 'u21', email: 'e', address: null, phoneNumber: null, role: 'user', save: jest.fn().mockRejectedValue(new Error('save err')) };
    User.findByPk = jest.fn().mockResolvedValue(user);

    await updateUserRole(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'save err' });
  });

  test('getUserById - findByPk throws -> 500', async () => {
    const req = { params: { id: 99 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    User.findByPk = jest.fn().mockRejectedValue(new Error('find fail'));

    await getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'find fail' });
  });

  test('register - generic error -> 400 with message', async () => {
    const req = { body: { username: 'u99', password: 'p', email: 'e@e.com' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    User.findOne = jest.fn().mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('h');
    User.create = jest.fn().mockRejectedValue(new Error('create fail'));

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'create fail' });
  });

  test('login - findOne throws -> 400', async () => {
    const req = { body: { username: 'uX', password: 'p' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    User.findOne = jest.fn().mockRejectedValue(new Error('db error'));

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'db error' });
  });
});
