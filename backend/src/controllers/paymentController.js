const getStripe = require('../utils/stripe');

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;
  const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe dùng đơn vị cent
      currency: 'vnd',
      automatic_payment_methods: { enabled: true },
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
