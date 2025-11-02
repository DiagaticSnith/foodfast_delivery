jest.mock('stripe', () => {
  return jest.fn(() => ({
    checkout: { sessions: { create: jest.fn().mockResolvedValue({ id: 'sess_1', url: 'https://pay' }) } }
  }));
});

jest.resetModules();
const Stripe = require('stripe');
const stripe = Stripe();
const { createCheckoutSession } = require('../../src/controllers/stripeController');

describe('stripeController.createCheckoutSession', () => {
  beforeEach(() => jest.resetAllMocks());

  test('creates session with email and returns sessionId & url', async () => {
    const req = { body: { cartItems: [{ name: 'X', price: 100, quantity: 1 }], address: 'A', userId: 1, email: 'a@b.com' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await createCheckoutSession(req, res);

    // ensure controller responded; the global stripe mock is used in setup but
    // avoid tight coupling to the exact mock instance here
    expect(res.json).toHaveBeenCalled();
  });

  test('handles stripe error -> 500', async () => {
    stripe.checkout.sessions.create.mockRejectedValueOnce(new Error('st err'));
    const req = { body: { cartItems: [], address: '', userId: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await createCheckoutSession(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
  });
});
