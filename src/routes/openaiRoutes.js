// routes/openaiRoutes.js
import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import isAdmin from "../middlewares/isAdmin.js";
import {
  generateProductDescription,
  summarizeOrders,
} from "../controllers/openaiController.js";

const router = express.Router();

router.post("/product-description", authMiddleware, generateProductDescription);

router.post("/summarize-orders", authMiddleware, isAdmin, summarizeOrders);

export default router;
