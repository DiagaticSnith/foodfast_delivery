jest.mock('../../src/models', () => ({
  Order: { create: jest.fn(), findOne: jest.fn(), findAll: jest.fn(), findByPk: jest.fn() },
  Drone: { findByPk: jest.fn(), findOne: jest.fn() },
  OrderDetail: { create: jest.fn() },
  Menu: {},
  User: {},
}));

const { Order, Drone, OrderDetail } = require('../../src/models');
// Provide a dummy stripe key so the controller can require stripe safely in tests
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy';
const {
  createOrder,
  getOrderBySessionId,
  updateOrderStatus,
  getUserOrders,
  rejectOrder,
} = require('../../src/controllers/orderController');

describe('orderController basic flows', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('createOrder - creates order and details', async () => {
    const req = { body: { userId: 1, total: 100, address: 'A', items: [{ menuId: 5, quantity: 2, price: 10 }], sessionId: 's1' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    const fakeOrder = { id: 11, userId: 1, total: 100 };
    Order.create.mockResolvedValue(fakeOrder);
    OrderDetail.create.mockResolvedValue({});

    await createOrder(req, res);

    expect(Order.create).toHaveBeenCalledWith(expect.objectContaining({ userId: 1, total: 100, status: 'Pending', sessionId: 's1' }));
    expect(OrderDetail.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeOrder);
  });

  test('getOrderBySessionId - not found -> 404', async () => {
    const req = { params: { sessionId: 'x' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    Order.findOne.mockResolvedValue(null);
    Order.findAll.mockResolvedValue([]);

    await getOrderBySessionId(req, res);

    expect(Order.findOne).toHaveBeenCalledWith({ where: { sessionId: 'x' } });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Không tìm thấy đơn hàng' });
  });

  test('getOrderBySessionId - found -> returns order', async () => {
    const req = { params: { sessionId: 's2' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    const o = { id: 2, toJSON: () => ({ id: 2 }) };
    Order.findOne.mockResolvedValue(o);

    await getOrderBySessionId(req, res);

    expect(res.json).toHaveBeenCalledWith(o);
  });

  test('updateOrderStatus - invalid status -> 400', async () => {
    const req = { params: { id: 1 }, body: { status: 'InvalidState' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await updateOrderStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Trạng thái không hợp lệ' });
  });

  test('updateOrderStatus - Done releases drone', async () => {
    const req = { params: { id: 3 }, body: { status: 'Done' } };
    const order = { id: 3, droneId: 7, status: 'Delivering', save: jest.fn().mockResolvedValue() };
    const drone = { id: 7, status: 'busy', save: jest.fn().mockResolvedValue() };
    Order.findByPk.mockResolvedValueOnce(order).mockResolvedValueOnce(order); // first fetch for order, later for return
    Drone.findByPk.mockResolvedValue(drone);
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await updateOrderStatus(req, res);

    expect(Order.findByPk).toHaveBeenCalledWith(3);
    expect(drone.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Cập nhật trạng thái thành công' }));
  });

  test('getUserOrders - returns array', async () => {
    const req = { params: { userId: 5 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    Order.findAll.mockResolvedValue([{ id: 1 }]);

    await getUserOrders(req, res);

    expect(Order.findAll).toHaveBeenCalledWith({ where: { userId: 5 } });
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  test('rejectOrder - not found -> 404', async () => {
    const req = { params: { id: 99 }, body: { reason: 'no' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    Order.findByPk.mockResolvedValue(null);

    await rejectOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Order not found' });
  });

  test('rejectOrder - success', async () => {
    const req = { params: { id: 10 }, body: { reason: 'bad' } };
    const order = { id: 10, save: jest.fn().mockResolvedValue(), status: 'Pending', description: null };
    Order.findByPk.mockResolvedValue(order);
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await rejectOrder(req, res);

    expect(order.status).toBe('Rejected');
    expect(order.description).toBe('bad');
    expect(order.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Đã từ chối đơn' }));
  });

  test('createOrder - no items does not create OrderDetail', async () => {
    const req = { body: { userId: 2, total: 50, address: 'X', items: [], sessionId: 's3' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    const fakeOrder = { id: 20, userId: 2, total: 50 };
    Order.create.mockResolvedValue(fakeOrder);

    await createOrder(req, res);

    expect(Order.create).toHaveBeenCalled();
    expect(OrderDetail.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('updateOrderStatus - Accepted with autoAssign success', async () => {
    // First call to findByPk (for update) returns order without drone
    const order = { id: 30, droneId: null, status: 'Pending', save: jest.fn().mockResolvedValue() };
    // After autoAssign, controller will call Order.findByPk(order.id) to return updated order
    const updatedOrder = { id: 30, droneId: 55, status: 'Accepted' };

    // Mock transaction to run the autoAssign flow using Order and Drone mocks
    const cfg = require('../../src/config/db');
    cfg.sequelize.transaction = jest.fn(async (cb) => cb({ LOCK: { UPDATE: 'UPDATE' } }));

    Order.findByPk.mockResolvedValueOnce(order).mockResolvedValueOnce(updatedOrder);
    Drone.findOne.mockResolvedValueOnce({ id: 55, status: 'available', save: jest.fn().mockResolvedValue() });

    const req = { params: { id: 30 }, body: { status: 'Accepted' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await updateOrderStatus(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Đã xác nhận và gán drone') }));
  });

  test('updateOrderStatus - Accepted but NO_DRONE', async () => {
    const order = { id: 31, droneId: null, status: 'Pending', save: jest.fn().mockResolvedValue() };
    const cfg = require('../../src/config/db');
    cfg.sequelize.transaction = jest.fn(async (cb) => cb({ LOCK: { UPDATE: 'UPDATE' } }));

    // two calls: one before transaction and one inside transaction
    Order.findByPk.mockResolvedValueOnce(order).mockResolvedValueOnce(order);
    Drone.findOne.mockResolvedValueOnce(null);

    const req = { params: { id: 31 }, body: { status: 'Accepted' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await updateOrderStatus(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Đã xác nhận đơn. Chưa có drone available.' }));
  });

  test('updateOrderStatus - autoAssign throws -> returns 500', async () => {
    const order = { id: 32, droneId: null, status: 'Pending', save: jest.fn().mockResolvedValue() };
    const cfg = require('../../src/config/db');
    cfg.sequelize.transaction = jest.fn(async () => { throw new Error('tx boom'); });

    Order.findByPk.mockResolvedValueOnce(order);

    const req = { params: { id: 32 }, body: { status: 'Accepted' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await updateOrderStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Lỗi khi tự gán drone' }));
  });

  test('updateOrderStatus - Delivering returns delivering message', async () => {
    const order = { id: 33, droneId: null, status: 'Accepted', save: jest.fn().mockResolvedValue() };
    Order.findByPk.mockResolvedValue(order);

    const req = { params: { id: 33 }, body: { status: 'Delivering' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await updateOrderStatus(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Đơn đang giao tới khách hàng' }));
  });

  test('getAllOrders - filters by restaurantId', async () => {
    const menu = { id: 1, restaurantId: 5 };
    const orders = [
      { id: 1, OrderDetails: [], OrderDetailsLength: 0 },
      { id: 2, OrderDetails: [{ Menu: menu }] },
    ];
    Order.findAll.mockResolvedValue(orders);

    const req = { query: { restaurantId: '5' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await (require('../../src/controllers/orderController').getAllOrders)(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([orders[1]]));
  });

  test('getAllOrders - no restaurantId returns all orders', async () => {
    const orders = [{ id: 1 }, { id: 2 }];
    Order.findAll.mockResolvedValue(orders);

    const req = { query: { } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await (require('../../src/controllers/orderController').getAllOrders)(req, res);

    expect(res.json).toHaveBeenCalledWith(orders);
  });

  test('getAllOrders - error -> 500', async () => {
    Order.findAll.mockRejectedValue(new Error('oh no'));
    const req = { query: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await (require('../../src/controllers/orderController').getAllOrders)(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'oh no' });
  });

  test('assignDrone & assignShipper return 410 deprecated', async () => {
    const controller = require('../../src/controllers/orderController');
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await controller.assignDrone({}, res);
    expect(res.status).toHaveBeenCalledWith(410);

    await controller.assignShipper({}, res);
    expect(res.status).toHaveBeenCalledWith(410);
  });

  // Tests for autoAssignDroneForOrder helper
  test('autoAssignDroneForOrder - order not found throws', async () => {
    const controller = require('../../src/controllers/orderController');
    const cfg = require('../../src/config/db');
    cfg.sequelize.transaction = jest.fn(async (cb) => cb({ LOCK: { UPDATE: 'UPDATE' } }));

    Order.findByPk.mockResolvedValue(null);

    await expect(controller.autoAssignDroneForOrder(999)).rejects.toThrow('Order not found');
  });

  test('autoAssignDroneForOrder - already has drone returns id', async () => {
    const controller = require('../../src/controllers/orderController');
    const cfg = require('../../src/config/db');
    cfg.sequelize.transaction = jest.fn(async (cb) => cb({ LOCK: { UPDATE: 'UPDATE' } }));

    const order = { id: 50, droneId: 77, save: jest.fn() };
    Order.findByPk.mockResolvedValue(order);

    const id = await controller.autoAssignDroneForOrder(50);
    expect(id).toBe(77);
  });

  test('autoAssignDroneForOrder - assigns drone successfully', async () => {
    const controller = require('../../src/controllers/orderController');
    const cfg = require('../../src/config/db');
    cfg.sequelize.transaction = jest.fn(async (cb) => cb({ LOCK: { UPDATE: 'UPDATE' } }));

    const order = { id: 51, droneId: null, save: jest.fn().mockResolvedValue() };
    const drone = { id: 88, status: 'available', save: jest.fn().mockResolvedValue() };
    Order.findByPk.mockResolvedValueOnce(order);
    Drone.findOne.mockResolvedValueOnce(drone);

    const id = await controller.autoAssignDroneForOrder(51);
    expect(id).toBe(88);
    expect(drone.save).toHaveBeenCalled();
    expect(order.save).toHaveBeenCalled();
  });

  test('autoAssignDroneForOrder - no drone -> throws NO_DRONE', async () => {
    const controller = require('../../src/controllers/orderController');
    const cfg = require('../../src/config/db');
    cfg.sequelize.transaction = jest.fn(async (cb) => cb({ LOCK: { UPDATE: 'UPDATE' } }));

    const order = { id: 52, droneId: null, save: jest.fn() };
    Order.findByPk.mockResolvedValueOnce(order);
    Drone.findOne.mockResolvedValueOnce(null);

    await expect(controller.autoAssignDroneForOrder(52)).rejects.toMatchObject({ message: 'No available drone' });
  });
});
