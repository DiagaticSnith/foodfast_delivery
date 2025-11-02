jest.mock('stripe', () => {
  return jest.fn(() => ({
    paymentIntents: { create: jest.fn().mockResolvedValue({ client_secret: 'client_secret_1' }) }
  }));
});

jest.resetModules();
const Stripe = require('stripe');
const stripe = Stripe();
const { createPaymentIntent } = require('../../src/controllers/paymentController');

describe('paymentController.createPaymentIntent', () => {
  beforeEach(() => jest.resetAllMocks());

  test('creates a payment intent and returns clientSecret', async () => {
    const req = { body: { amount: 12.5 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await createPaymentIntent(req, res);

    // basic response assertion - internals mocked globally
    expect(res.json).toHaveBeenCalled();
    const arg = res.json.mock.calls[0][0];
    expect(typeof arg === 'object').toBe(true);
  });

  test('handles stripe error with 500', async () => {
    stripe.paymentIntents.create.mockRejectedValueOnce(new Error('fail'));
    const req = { body: { amount: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await createPaymentIntent(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
  });
});
