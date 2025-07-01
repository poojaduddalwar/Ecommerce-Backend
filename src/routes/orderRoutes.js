// routes/orderRoutes.js
import express from 'express';
import {
  createOrder,
  verifyPayment,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  razorpayWebhook,
  handleCashfreeWebhook
} from '../controllers/orderController.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';
import { isAdmin } from '../middlewares/isAdmin.js';

const router = express.Router();

// 📦 Create Razorpay Order
router.post('/createOrder', authMiddleware, createOrder);

// ✅ Verify Razorpay Payment
router.post('/verify', authMiddleware, verifyPayment);

// 🔁 Razorpay Webhook - Needs raw body
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  razorpayWebhook
);

// 💰 Cashfree Webhook - Also needs raw body
router.post(
  '/cashfree-webhook',
  express.raw({ type: 'application/json' }),
  handleCashfreeWebhook
);

// 👤 Get Orders for Logged-in User
router.get('/myOrders', authMiddleware, getMyOrders);

// 👑 Admin: Get All Orders
router.get('/all', authMiddleware, isAdmin, getAllOrders);

// 🛠️ Admin: Update Order Status
router.put('/status/:orderId', authMiddleware, isAdmin, updateOrderStatus);

// ❌ Cancel Order
router.post('/cancel/:orderId', authMiddleware, cancelOrder);

export default router;
