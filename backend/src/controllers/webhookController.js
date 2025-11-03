// backend/src/controllers/webhookController.js

/**
 * Controller to handle incoming webhook events
 * Customize this logic based on your webhook provider (e.g., Stripe, PayPal, etc.)
 */

const getStripe = require('../utils/stripe');
const endpointSecret = process.env.ENDPOINT_SECRET;
const { User, Cart, CartItem, Menu, Order, OrderDetail } = require('../models');

exports.handleWebhook = async (req, res) => {
    let event = req.body;
    // Stripe recommends verifying the signature for security
    if (endpointSecret && req.headers['stripe-signature']) {
            try {
                event = getStripe().webhooks.constructEvent(req.rawBody, req.headers['stripe-signature'], endpointSecret);
            } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            console.error('Stripe-Signature:', req.headers['stripe-signature']);
            console.error('ENDPOINT_SECRET:', endpointSecret);
            console.error('typeof req.rawBody:', typeof req.rawBody);
            console.error('req.rawBody (first 200 bytes):', req.rawBody && req.rawBody.slice ? req.rawBody.slice(0,200) : req.rawBody);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        try {
            // Lấy userId và address từ metadata
            const userId = session.metadata.userId;
            const address = session.metadata.address;
            // Lấy line items
                const lineItems = await getStripe().checkout.sessions.listLineItems(session.id);
            // Tạo Order
            const order = await Order.create({
                userId,
                total: session.amount_total, // Đơn vị VND
                address,
                status: 'Pending',
                sessionId: session.id,
            });
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
            return res.status(500).json({ error: err.message });
        }
    }

    res.status(200).json({ received: true });
};
