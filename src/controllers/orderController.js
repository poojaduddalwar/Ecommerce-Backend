// controllers/orderController.js
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import OpenAI from 'openai';

// Initialize OpenAI with API Key from .env
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Handle webhook from Cashfree after payment success
 * Cashfree will POST to this endpoint with order status and metadata
 */
export const handleCashfreeWebhook = async (req, res) => {
  try {
    const {
      order_id,
      order_status,
      payment_mode,
      order_amount,
      payment_time,
      customer_details,
      order_meta,
    } = req.body;

    // 🛡️ (Optional) Verify webhook signature via x-cf-signature header

    // Proceed only if payment succeeded
    if (order_status !== 'PAID') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    // Extract metadata from the order
    const { items, shippingAddress, userId } = order_meta;

    if (!items || !shippingAddress || !userId) {
      return res.status(400).json({ message: 'Incomplete order metadata' });
    }

    // 🧠 Generate product descriptions for OpenAI summary
    const productDetails = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product);
        return `- ${product.name} (x${item.quantity})`;
      })
    );

    // 📝 Compose the prompt
    const summaryPrompt = `
Summarize the following order:

Shipping to:
${shippingAddress.fullName}, ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.country}.

Items:
${productDetails.join('\n')}

Total: ₹${order_amount}
Payment Method: ${payment_mode}
    `;

    // 💬 Generate order summary using OpenAI
    const summaryResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: summaryPrompt }],
      max_tokens: 150,
    });

    const orderSummary = summaryResponse.choices[0].message.content.trim();

    // 🧾 Save the order
    const newOrder = new Order({
      user: userId,
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

    return res.status(200).json({ success: true, message: 'Order created after payment', orderId: newOrder._id });
  } catch (error) {
    console.error('Cashfree Webhook Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process payment webhook' });
  }
};
