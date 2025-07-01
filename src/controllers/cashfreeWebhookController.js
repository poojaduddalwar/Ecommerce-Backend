// controllers/cashfreeWebhookController.js
import crypto from 'crypto';
import Order from '../models/orderModel.js';
import Cart from '../models/cartModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import OpenAI from 'openai';

const CF_SECRET_KEY = process.env.CF_SECRET_KEY;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const handleCashfreeWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const payload = JSON.stringify(req.body);
    const expected = crypto.createHmac('sha256', CF_SECRET_KEY).update(payload).digest('base64');
    if (signature !== expected) return res.status(401).json({ message: 'Invalid webhook signature' });

    const event = req.body;
    if (event?.event !== 'PAYMENT_SUCCESS') return res.status(200).json({ message: 'Event ignored' });

    const { order_id, order_amount, customer_details, payment_method, payment_time, order_meta } = event.data;
    const { items, shippingAddress, userId } = order_meta;
    if (!items || !shippingAddress || !userId) return res.status(400).json({ message: 'Incomplete order metadata' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const productDetails = await Promise.all(items.map(async item => {
      const p = await Product.findById(item.product);
      return `- ${p.name} (x${item.quantity})`;
    }));

    const summaryPrompt = `
Customer ${user.email} shipping to ${shippingAddress.fullName}, ${shippingAddress.city}, ${shippingAddress.country}.
Items:
${productDetails.join('\n')}
Total: ₹${order_amount}
Payment via: ${payment_method}
    `;
    const aiRes = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: summaryPrompt }],
      max_tokens: 150
    });

    const newOrder = await new Order({
      user: user._id,
      items,
      shippingAddress,
      totalAmount: order_amount,
      paymentMethod: payment_method,
      paymentStatus: 'Paid',
      paidAt: payment_time ? new Date(payment_time) : new Date(),
      cashfreeOrderId: order_id,
      status: 'Pending',
      summary: aiRes.choices[0].message.content.trim()
    }).save();

    await Cart.deleteOne({ userId: user._id });
    res.status(200).json({ success: true, orderId: newOrder._id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Webhook processing error' });
  }
};
