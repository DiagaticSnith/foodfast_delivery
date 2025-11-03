// Lazy Stripe initializer to avoid crashing at import time when STRIPE_SECRET_KEY is not set.
// Controllers can call getStripe() to obtain a configured Stripe client.
let stripeInstance = null;

module.exports = function getStripe() {
  if (stripeInstance) return stripeInstance;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set. Set STRIPE_SECRET_KEY in environment to use Stripe features.');
  }
  const Stripe = require('stripe');
  stripeInstance = Stripe(key);
  return stripeInstance;
};
