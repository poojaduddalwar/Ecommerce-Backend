import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.stock < quantity)
      return res.status(400).json({ message: "Insufficient stock" });

    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $setOnInsert: { expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } },
      { upsert: true, new: true }
    );

    const existingItem = cart.items.find((item) => item.product.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    next(err);
  }
};

export const getUserCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate("items.product");
    res.status(200).json({ cart });
  } catch (error) {
    res.status(500).json({ message: "Failed to get cart" });
  }
};

export const updateCart = async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity < 1) {
    return res.status(400).json({ message: "Invalid product or quantity" });
  }

  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({
        userId: req.user._id,
        items: [{ product: productId, quantity }]
      });
    } else {
      const itemIndex = cart.items.findIndex((item) => item.product.equals(productId));
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity;
        const product = await Product.findById(productId);
        if (product.stock < quantity) return res.status(400).json({ message: 'Insufficient stock' });
        cart.items[itemIndex].quantity = quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
    }

    await cart.save();
    res.status(200).json({ cart, message: "Cart updated" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update cart" });
  }
};

export const removeItemFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => !item.product.equals(req.params.productId)
    );

    await cart.save();
    res.status(200).json({ cart, message: "Item removed" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove item" });
  }
};

export const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.user._id });
    res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ message: "Failed to clear cart" });
  }
};

export const getAllCartsAdmin = async (req, res) => {
  try {
    const carts = await Cart.find()
      .populate("userId", "email")
      .populate("items.product");
    res.status(200).json({ carts });
  } catch (error) {
    res.status(500).json({ message: "Failed to get all carts" });
  }
};
