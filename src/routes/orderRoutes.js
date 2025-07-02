import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/isAdmin.js';

// Cashfree payment controllers
import { initiatePayment } from '../controllers/cashfreeController.js';
import { handleCashfreeWebhook } from '../controllers/cashfreeWebhookController.js';

// Order management controllers
import {
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/orderController.js';

const router = express.Router();

// 💳 Create payment session via Cashfree
router.post('/create-order', authMiddleware, initiatePayment);

// 🔔 Cashfree webhook endpoint (raw body)
router.post(
  '/cashfree-webhook',
  express.raw({ type: 'application/json' }),
  handleCashfreeWebhook
);

// 👤 Get orders for logged-in user
router.get('/my-orders', authMiddleware, getMyOrders);

// 👑 Admin: get all orders
router.get('/all-orders', authMiddleware, isAdmin, getAllOrders);

// 🚚 Admin: update order status
router.put('/status/:orderId', authMiddleware, isAdmin, updateOrderStatus);

// ❌ Cancel an order
router.post('/cancel/:orderId', authMiddleware, cancelOrder);

export default router;
