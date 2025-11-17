const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  try {
    const { cartItems, address, userId, email } = req.body;
    // Chuyển cartItems sang line_items cho Stripe
    const line_items = cartItems.map(item => {
      const productData = { name: item.name };
      if (item.imageUrl && item.imageUrl.trim() !== '') {
        productData.images = [item.imageUrl];
      }
      return {
        price_data: {
          currency: 'vnd',
          product_data: productData,
          unit_amount: Math.round(item.price),
        },
        quantity: item.quantity,
      };
    });
    
    const sessionConfig = {
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/cancel`,
      metadata: {
        address,
        userId,
      },
    };
    
    // Pre-fill customer email if provided
    if (email) {
      sessionConfig.customer_email = email;
    }
    
    const session = await stripe.checkout.sessions.create(sessionConfig);
    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    try {
      const { stripeErrors } = require('../metrics');
      if (stripeErrors && typeof stripeErrors.labels === 'function') stripeErrors.labels('create_session').inc();
    } catch (e) {
      console.warn('Could not increment stripeErrors metric', e && e.message);
    }
    res.status(500).json({ error: err.message });
  }
};
