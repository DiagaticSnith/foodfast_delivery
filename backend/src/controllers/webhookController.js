// backend/src/controllers/webhookController.js

/**
 * Controller to handle incoming webhook events
 * Customize this logic based on your webhook provider (e.g., Stripe, PayPal, etc.)
 */

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.ENDPOINT_SECRET;
const { User, Cart, CartItem, Menu, Order, OrderDetail } = require('../models');

exports.handleWebhook = async (req, res) => {
    let event = req.body;
    // Stripe recommends verifying the signature for security
    if (endpointSecret && req.headers['stripe-signature']) {
        try {
            event = stripe.webhooks.constructEvent(req.rawBody, req.headers['stripe-signature'], endpointSecret);
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            console.error('Stripe-Signature:', req.headers['stripe-signature']);
            console.error('ENDPOINT_SECRET:', endpointSecret);
            console.error('typeof req.rawBody:', typeof req.rawBody);
            console.error('req.rawBody (first 200 bytes):', req.rawBody && req.rawBody.slice ? req.rawBody.slice(0,200) : req.rawBody);
            try {
                const { stripeErrors } = require('../metrics');
                if (stripeErrors && typeof stripeErrors.labels === 'function') stripeErrors.labels('webhook_signature').inc();
            } catch (e) {
                console.warn('Could not increment stripeErrors metric for webhook signature', e && e.message);
            }
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        try {
            // Lấy userId và address từ metadata (metadata may be undefined)
            let userId = session.metadata && session.metadata.userId ? session.metadata.userId : null;
            const address = session.metadata && session.metadata.address ? session.metadata.address : null;

            // If metadata.userId is missing, try to resolve the user from the session's customer info
            // (e.g. customer_email or customer_details.email). This helps when sessions are created
            // without explicit metadata but the customer email matches an existing user.
            if (!userId) {
                const possibleEmail = session.customer_email || (session.customer_details && session.customer_details.email);
                if (possibleEmail) {
                    try {
                        const possibleUser = await User.findOne({ where: { email: possibleEmail } });
                        if (possibleUser) userId = possibleUser.id;
                    } catch (e) {
                        console.warn('Error looking up user by email in webhook:', e && e.message);
                    }
                }
            }

            // If we still don't have a userId, bail out — the Order model requires userId.
            if (!userId) {
                console.error('Webhook missing userId and unable to resolve user from session. Aborting order creation. session.id=', session.id, 'session.customer_email=', session.customer_email);
                try {
                    const { stripeErrors } = require('../metrics');
                    if (stripeErrors && typeof stripeErrors.labels === 'function') stripeErrors.labels('webhook_missing_user').inc();
                } catch (e) {}
                // Return 400 so the event can be investigated (Stripe will retry). Avoid creating an invalid Order.
                return res.status(400).json({ error: 'Missing userId in checkout session metadata and could not resolve user by email' });
            }
            // Lấy line items
            const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
            // Tạo Order
            const order = await Order.create({
                userId,
                total: session.amount_total, // Đơn vị VND
                address,
                status: 'Pending',
                sessionId: session.id,
            });
            // Business metrics: increment orders and checkout success for webhook-created orders
            try {
                const { ordersCreated, checkoutSuccess } = require('../metrics');
                if (ordersCreated && typeof ordersCreated.labels === 'function') ordersCreated.labels('webhook').inc();
                if (checkoutSuccess && typeof checkoutSuccess.labels === 'function') checkoutSuccess.labels('webhook').inc();
            } catch (e) {
                console.warn('Could not increment business metrics in webhook', e && e.message);
            }
            // Tạo OrderDetails
                        for (const item of lineItems.data) {
                                let menuId = null;
                                // Nếu metadata có menuId, ưu tiên lấy
                                if (item.price && item.price.product && item.price.product.metadata && item.price.product.metadata.menuId) {
                                    menuId = item.price.product.metadata.menuId;
                                } else {
                                    // Fallback: tìm theo tên
                                    const menu = await Menu.findOne({ where: { name: item.description } });
                                    if (menu) menuId = menu.id;
                                    else console.warn('Không tìm thấy menu cho item:', item.description);
                                }
                                                console.log('Tạo OrderDetail:', {
                                                    orderId: order.id,
                                                    menuId,
                                                    quantity: item.quantity,
                                                    price: item.amount_total,
                                                    item
                                                });
                                                await OrderDetail.create({
                                                        orderId: order.id,
                                                        menuId,
                                                        quantity: item.quantity,
                                                        price: item.amount_total, // Đơn vị VND
                                                });
                        }
            // Clear cart
            const cart = await Cart.findOne({ where: { userId } });
            if (cart) {
                await CartItem.destroy({ where: { cartId: cart.id } });
            }
            console.log('Order created and cart cleared for user', userId);
        } catch (err) {
            console.error('Error processing checkout.session.completed:', err);
            try {
                const { stripeErrors } = require('../metrics');
                if (stripeErrors && typeof stripeErrors.labels === 'function') stripeErrors.labels('webhook_processing').inc();
            } catch (e) {
                console.warn('Could not increment stripeErrors metric for webhook processing', e && e.message);
            }
            return res.status(500).json({ error: err.message });
        }
    }

    res.status(200).json({ received: true });
};
