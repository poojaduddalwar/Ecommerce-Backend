import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import isAdmin from "../middlewares/isAdmin.js";
import {
  addToCart,
  getUserCart,
  updateCart,
  removeItemFromCart,
  clearCart,
  getAllCartsAdmin
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/", authMiddleware, getUserCart);
router.post("/", authMiddleware, updateCart);
router.post("/add", authMiddleware, addToCart);
router.delete("/:productId", authMiddleware, removeItemFromCart);
router.delete("/clear/all", authMiddleware, clearCart);
router.get("/admin/all", authMiddleware, isAdmin, getAllCartsAdmin);

export default router;
