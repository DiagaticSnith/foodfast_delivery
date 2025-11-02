// Global Jest setup to mock stripe and silence noisy logs

jest.mock('stripe', () => {
  return jest.fn(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({ id: 'sess_1', url: 'https://pay' }),
        retrieve: jest.fn().mockResolvedValue({ id: 'sess_1', metadata: { userId: 2, address: 'X' }, amount_total: 2500 }),
        listLineItems: jest.fn().mockResolvedValue({ data: [{ description: 'Pizza', quantity: 2, amount_total: 1000 }] })
      }
    },
    paymentIntents: {
      create: jest.fn().mockResolvedValue({ client_secret: 'client_secret_1' })
    }
  }));
});

// Quiet console.error in tests unless the test explicitly needs it
const originalConsoleError = console.error;
beforeAll(() => {
  try {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  } catch (e) {
    // ignore
  }
});
afterAll(async () => {
  // restore original if we replaced it
  try { console.error = originalConsoleError; } catch (e) {}
  // attempt to stop background services (e.g. dispatcher intervals) to avoid leaked handles
  try {
    const dispatcher = require('../src/utils/droneDispatcher');
    if (dispatcher && typeof dispatcher.stop === 'function') dispatcher.stop();
  } catch (e) {
    // ignore if module not present or already mocked
  }
  // try to close sequelize if it exists (some modules create it on import)
  try {
    const db = require('../src/config/db');
    if (db && db.sequelize && typeof db.sequelize.close === 'function') {
      await db.sequelize.close();
    }
  } catch (e) {
    // ignore errors if db was mocked or not present
  }
  // ensure timers are returned to real timers
  try { jest.useRealTimers(); } catch (e) {}
});
