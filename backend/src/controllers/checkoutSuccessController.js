const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { Order } = require('../models/Order');
const { OrderDetail } = require('../models/OrderDetail');
const { Menu } = require('../models/Menu');

exports.handleCheckoutSuccess = async (req, res) => {
  try {
    const session_id = req.query.session_id;
    if (!session_id) return res.status(400).json({ message: 'Missing session_id' });
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const lineItems = await stripe.checkout.sessions.listLineItems(session_id);
    // Tạo Order
    const order = await Order.create({
      userId: session.metadata.userId,
      total: session.amount_total / 100,
      address: session.metadata.address,
  status: 'Pending',
    });
    // Business metrics: orders created and checkout success
    try {
      const { ordersCreated, checkoutSuccess } = require('../metrics');
      if (ordersCreated && typeof ordersCreated.labels === 'function') ordersCreated.labels('stripe').inc();
      if (checkoutSuccess && typeof checkoutSuccess.labels === 'function') checkoutSuccess.labels('stripe').inc();
    } catch (e) {
      console.warn('Could not increment business metrics for checkout success', e && e.message);
    }
    // Tạo OrderDetails
    for (const item of lineItems.data) {
      // Tìm menuId theo tên món (hoặc truyền metadata menuId khi tạo session Stripe)
      const menu = await Menu.findOne({ where: { name: item.description } });
      await OrderDetail.create({
        orderId: order.id,
        menuId: menu ? menu.id : null,
        quantity: item.quantity,
        price: item.amount_total / 100,
      });
    }
    res.json({ orderId: order.id });
  } catch (err) {
    console.error('Checkout success error:', err);
    try {
      const { stripeErrors } = require('../metrics');
      if (stripeErrors && typeof stripeErrors.labels === 'function') stripeErrors.labels('checkout_success').inc();
    } catch (e) {
      console.warn('Could not increment stripeErrors metric for checkout success', e && e.message);
    }
    res.status(500).json({ error: err.message });
  }
};
