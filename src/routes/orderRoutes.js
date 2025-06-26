import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import authMiddleware from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/isAdmin.js';
import Product from '../services/mongodb/models/Product.js';
import Order from '../services/mongodb/models/Order.js';
import Cart from '../services/mongodb/models/Cart.js';

const router = express.Router();

// POST /api/v1/order/createOrder
router.post(
  "/createOrder",
  authMiddleware,
  [body("totalAmount").isInt({ min: 1 }).withMessage("Total amount must be valid")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { totalAmount } = req.body;

      const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const options = {
        amount: totalAmount,
        currency: "INR",
        receipt: `receipt_order_${uuidv4()}`,
      };

      const order = await instance.orders.create(options);
      if (!order) return res.status(500).json({ message: "Failed to create Razorpay order" });
      res.json(order);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Failed to create Razorpay order" });
    }
  }
);

// POST /api/v1/order/verify
router.post(
  "/verify",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        orderCreationId,
        razorpayPaymentId,
        razorpayOrderId,
        razorpaySignature,
        shippingAddress,
        totalAmount
      } = req.body;

      const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
      shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
      const digest = shasum.digest("hex");

      if (digest !== razorpaySignature) {
        return res.status(400).json({ message: "Transaction not legit!" });
      }

      // Fetch cart items from the database
      const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty or not found" });
      }

      const items = cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity
      }));

      // Reduce stock for each item
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) continue;

        if (product.stock < item.quantity) {
          return res.status(400).json({ message: `Product ${product.name} is out of stock` });
        }

        product.stock -= item.quantity;
        await product.save();
      }

      // Create order
      const order = new Order({
        user: req.user._id,
        items,
        totalAmount,
        shippingAddress,
        status: "Processing",
        paymentInfo: {
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature
        }
      });

      await order.save();

      // Clear the user's cart
      cart.items = [];
      await cart.save();

      res.json({
        message: "Order placed successfully",
        order,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Payment verification failed" });
    }
  }
);

// POST /api/v1/order/webhook
router.post("/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];
    const body = req.body.toString('utf8');
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    console.log("Webhook verified:", req.body);
    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Webhook error" });
  }
});

// GET /api/v1/order/myOrders
router.get("/myOrders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "name price images")
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch user orders" });
  }
});

// GET /api/v1/order/all
router.get("/all", authMiddleware, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .populate("items.product", "name price images")
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch all orders" });
  }
});

// PATCH /api/v1/order/:id/status
router.patch("/:id/status", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order status updated", order });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to update order status" });
  }
});

// DELETE /api/v1/order/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, user: req.user._id });

    if (!order) {
      return res.status(404).json({ message: "Order not found or not authorized" });
    }

    if (["Shipped", "Delivered"].includes(order.status)) {
      return res.status(400).json({ message: "Cannot cancel a shipped or delivered order" });
    }

    order.status = "Cancelled";
    await order.save();

    res.json({ message: "Order cancelled successfully", order });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to cancel order" });
  }
});

export default router;
