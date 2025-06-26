import express from "express";
import { body, validationResult } from "express-validator";
import Cart from "../services/mongodb/models/Cart.js";
import Product from "../services/mongodb/models/Product.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Utility to calculate total amount & items
const calculateCartSummary = (cart) => {
  const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  return { total, totalItems };
};

/*
  GET /api/v1/cart
  Auth Required
*/
router.get("/", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({ cart: null, total: 0, totalItems: 0, message: "Cart is empty" });
    }

    const { total, totalItems } = calculateCartSummary(cart);
    res.status(200).json({ cart, total, totalItems, message: "Fetched cart successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ cart: null, total: 0, totalItems: 0, message: "Error fetching cart" });
  }
});

/*
  POST /api/v1/cart/add
  Auth Required
*/
router.post(
  "/add",
  authMiddleware,
  body("productId").notEmpty().withMessage("Product ID is required"),
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array(), message: "Validation failed" });

    const { productId, quantity } = req.body;

    try {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: "Product not found" });
      if (product.stock < quantity)
        return res.status(400).json({ message: "Not enough stock available" });

      let cart = await Cart.findOne({ user: req.user._id });
      if (!cart) cart = new Cart({ user: req.user._id, items: [] });

      const index = cart.items.findIndex(item => item.product.toString() === productId);

      if (index > -1) {
        const newQty = cart.items[index].quantity + quantity;
        if (newQty > product.stock)
          return res.status(400).json({ message: "Exceeds stock limit" });

        cart.items[index].quantity = newQty;
      } else {
        cart.items.push({ product: productId, quantity });
      }

      product.stock -= quantity;
      await product.save();
      await cart.save();

      const populatedCart = await Cart.findOne({ user: req.user._id }).populate("items.product");
      const { total, totalItems } = calculateCartSummary(populatedCart);
      res.status(200).json({ cart: populatedCart, total, totalItems, message: "Item added to cart" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ cart: null, message: "Error adding item to cart" });
    }
  }
);

/*
  PUT /api/v1/cart/update
  Auth Required
*/
router.put(
  "/update",
  authMiddleware,
  body("productId").notEmpty().withMessage("Product ID is required"),
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array(), message: "Validation failed" });

    const { productId, quantity } = req.body;

    try {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: "Product not found" });

      const cart = await Cart.findOne({ user: req.user._id });
      if (!cart) return res.status(404).json({ message: "Cart not found" });

      const item = cart.items.find(item => item.product.toString() === productId);
      if (!item) return res.status(404).json({ message: "Product not in cart" });

      const difference = quantity - item.quantity;

      if (difference > 0 && product.stock < difference)
        return res.status(400).json({ message: "Not enough stock available" });

      item.quantity = quantity;
      product.stock -= difference;
      await product.save();
      await cart.save();

      const populatedCart = await Cart.findOne({ user: req.user._id }).populate("items.product");
      const { total, totalItems } = calculateCartSummary(populatedCart);
      res.status(200).json({ cart: populatedCart, total, totalItems, message: "Cart updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ cart: null, message: "Error updating cart" });
    }
  }
);

/*
  DELETE /api/v1/cart/remove/:productId
  Auth Required
*/
router.delete("/remove/:productId", authMiddleware, async (req, res) => {
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(i => i.product.toString() === productId);
    if (!item) return res.status(404).json({ message: "Item not found in cart" });

    const product = await Product.findById(productId);
    if (product) {
      product.stock += item.quantity;
      await product.save();
    }

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();

    const populatedCart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    const { total, totalItems } = calculateCartSummary(populatedCart);
    res.status(200).json({ cart: populatedCart, total, totalItems, message: "Item removed from cart" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ cart: null, message: "Error removing item from cart" });
  }
});

/*
  DELETE /api/v1/cart/clear
  Auth Required
*/
router.delete("/clear", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({ cart, total: 0, totalItems: 0, message: "Cart cleared" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ cart: null, message: "Error clearing cart" });
  }
});

export default router;
