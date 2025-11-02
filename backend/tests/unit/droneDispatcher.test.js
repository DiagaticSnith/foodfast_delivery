const { attemptAssignOne } = require('../../src/utils/droneDispatcher');

jest.mock('../../src/models', () => ({
  Order: { findOne: jest.fn() },
  Drone: { findOne: jest.fn() },
}));

jest.mock('../../src/config/db', () => ({
  sequelize: { transaction: jest.fn() },
}));

const { Order, Drone } = require('../../src/models');
const { sequelize } = require('../../src/config/db');

describe('droneDispatcher.attemptAssignOne', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // suppress dispatcher console logs during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  test('assigns when order and drone are available', async () => {
    const mockOrder = { id: 101, save: jest.fn(), droneId: null };
    const mockDrone = { id: 201, save: jest.fn(), status: 'available' };

    sequelize.transaction.mockImplementation(async (cb) => cb({ LOCK: { UPDATE: 'UPDATE' } }));

    Order.findOne.mockResolvedValueOnce(mockOrder);
    Drone.findOne.mockResolvedValueOnce(mockDrone);

    const res = await attemptAssignOne();

    expect(res).toBe(true);
    expect(mockDrone.save).toHaveBeenCalled();
    expect(mockOrder.save).toHaveBeenCalled();
    expect(mockOrder.droneId).toBe(201);
    expect(mockDrone.status).toBe('busy');
  });

  test('returns false when no eligible order found', async () => {
    sequelize.transaction.mockImplementation(async (cb) => cb({ LOCK: { UPDATE: 'UPDATE' } }));

    Order.findOne.mockResolvedValueOnce(null);

    const res = await attemptAssignOne();

    expect(res).toBe(false);
    expect(Drone.findOne).not.toHaveBeenCalled();
  });

  test('returns false when no drone available', async () => {
    const mockOrder = { id: 102, save: jest.fn(), droneId: null };

    sequelize.transaction.mockImplementation(async (cb) => cb({ LOCK: { UPDATE: 'UPDATE' } }));

    Order.findOne.mockResolvedValueOnce(mockOrder);
    Drone.findOne.mockResolvedValueOnce(null);

    const res = await attemptAssignOne();

    expect(res).toBe(false);
    expect(mockOrder.save).not.toHaveBeenCalled();
  });

  test('throws when transaction errors', async () => {
    // Simulate transaction throwing an error
    sequelize.transaction.mockImplementation(async () => { throw new Error('tx fail'); });

    await expect(attemptAssignOne()).rejects.toThrow('tx fail');
  });
});

describe('droneDispatcher start/stop and error handling', () => {
  let dispatcher;

  beforeEach(() => {
    jest.resetModules();
    dispatcher = require('../../src/utils/droneDispatcher');
  });

  afterEach(() => {
    // ensure stopped and restore timers
    try { dispatcher.stopDroneDispatcher(); } catch(e) {}
    jest.useRealTimers();
  });

  test('start and stop create and clear interval', () => {
    jest.useFakeTimers();
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    dispatcher.startDroneDispatcher({ intervalMs: 10, burst: 1 });
    expect(logSpy).toHaveBeenCalled();

    // advance a tick
    jest.advanceTimersByTime(20);

    dispatcher.stopDroneDispatcher();
    // no exception when stopping
    logSpy.mockRestore();
  });

  test('start handles attemptAssignOne throwing and logs error', async () => {
    // Use real timers here to let the interval run naturally and detect the error log
    jest.useRealTimers();
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  // Make the underlying transaction throw so attemptAssignOne rejects and runTick catches it
  const cfg = require('../../src/config/db');
  cfg.sequelize.transaction.mockImplementation(async () => { throw new Error('tx fail'); });

  // call the interval body directly via runTick for deterministic behavior
  await dispatcher.runTick({ burst: 1 });

  expect(errSpy).toHaveBeenCalled();

  errSpy.mockRestore();
  }, 10000);
});
