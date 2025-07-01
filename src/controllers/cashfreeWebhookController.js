import crypto from 'crypto';
import Order from '../models/orderModel.js';
import Cart from '../models/cartModel.js';
import User from '../models/userModel.js';

const CF_SECRET_KEY = process.env.CF_SECRET_KEY;

export const handleCashfreeWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const payload = JSON.stringify(req.body);

    // 🛡️ Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', CF_SECRET_KEY)
      .update(payload)
      .digest('base64');

    if (signature !== expectedSignature) {
      return res.status(401).json({ message: 'Invalid webhook signature' });
    }

    const event = req.body;

    // ✅ Only handle payment success event
    if (event?.event === 'PAYMENT_SUCCESS') {
      const {
        order_id,
        order_amount,
        customer_details,
        payment_method,
        payment_time
      } = event.data;

      const user = await User.findOne({ email: customer_details.customer_email });
      if (!user) return res.status(404).json({ message: 'User not found' });

      const cart = await Cart.findOne({ userId: user._id }).populate('items.productId');
      if (!cart) return res.status(404).json({ message: 'Cart not found' });

      // ✅ Save order
      const order = new Order({
        user: user._id,
        orderId: order_id,
        amount: order_amount,
        items: cart.items.map(item => ({
          product: item.productId._id,
          quantity: item.quantity,
          price: item.productId.price
        })),
        paymentMethod: payment_method,
        paymentStatus: 'Paid',
        orderedAt: new Date(payment_time)
      });
      await order.save();

      // ✅ Clear cart
      await Cart.deleteOne({ userId: user._id });

      return res.status(200).json({ message: 'Order created and cart cleared' });
    }

    res.status(200).json({ message: 'Webhook received' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Webhook handling error' });
  }
};
