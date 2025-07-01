// controllers/orderController.js
import crypto from 'crypto';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import Cart from '../models/cartModel.js';
import User from '../models/userModel.js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const CF_SECRET_KEY = process.env.CF_SECRET_KEY;

export const handleCashfreeWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto.createHmac('sha256', CF_SECRET_KEY).update(payload).digest('base64');

    if (signature !== expectedSignature) {
      return res.status(401).json({ message: 'Invalid webhook signature' });
    }

    const {
      order_id,
      order_status,
      payment_mode,
      order_amount,
      payment_time,
      order_meta,
    } = req.body;

    if (order_status !== 'PAID') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    const { items, shippingAddress, userId } = order_meta;
    if (!items || !shippingAddress || !userId) {
      return res.status(400).json({ message: 'Incomplete order metadata' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const productDetails = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product);
        return `- ${product.name} (x${item.quantity})`;
      })
    );

    const summaryPrompt = `
Customer ${user.email} shipping to ${shippingAddress.fullName}, ${shippingAddress.city}, ${shippingAddress.country}.
Items:
${productDetails.join('\n')}
Total: ₹${order_amount}
Payment Method: ${payment_mode}
    `;

    const summaryResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: summaryPrompt }],
      max_tokens: 150,
    });

    const orderSummary = summaryResponse.choices[0].message.content.trim();

    const newOrder = new Order({
      user: user._id,
      items,
      shippingAddress,
      totalAmount: order_amount,
      paymentMethod: payment_mode,
      paymentStatus: 'Paid',
      paidAt: payment_time ? new Date(payment_time) : new Date(),
      cashfreeOrderId: order_id,
      status: 'Pending',
      summary: orderSummary,
    });

    await newOrder.save();

    // Delete cart after successful order
    await Cart.deleteOne({ userId: user._id });

    return res.status(200).json({ success: true, message: 'Order created after payment', orderId: newOrder._id });
  } catch (error) {
    console.error('Cashfree Webhook Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process payment webhook' });
  }
};
