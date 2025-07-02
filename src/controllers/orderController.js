import mongoose from 'mongoose';
import Order from '../services/mongodb/models/Order.js';

// 👤 Fetch logged-in user's orders
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error('Get My Orders Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

// 👑 Admin: fetch all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email');
    return res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error('Get All Orders Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch all orders' });
  }
};

// 🚚 Admin: update an order's status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;
    if (status === 'Delivered') order.deliveredAt = new Date();

    await order.save();
    return res.status(200).json({ success: true, order });
  } catch (err) {
    console.error('Update Order Status Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

// ❌ Cancel an order (only if still pending)
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Only pending orders can be cancelled' });
    }

    order.status = 'Cancelled';
    order.cancelledAt = new Date();
    await order.save();

    return res.status(200).json({ success: true, message: 'Order cancelled', order });
  } catch (err) {
    console.error('Cancel Order Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to cancel order' });
  }
};