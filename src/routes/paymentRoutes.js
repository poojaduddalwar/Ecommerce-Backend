import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { initiatePayment } from '../controllers/cashfreeController.js';
import { handleCashfreeWebhook } from '../controllers/cashfreeWebhookController.js';


const router = express.Router();
router.post('/cashfree/initiate', authMiddleware, initiatePayment);
router.post('/cashfree/webhook', express.json({ type: '*/*' }), handleCashfreeWebhook);
export default router;
