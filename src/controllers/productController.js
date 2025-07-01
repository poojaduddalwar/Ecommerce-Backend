import Product from "../models/productModel.js";
import { validationResult } from "express-validator";

export const getAllProducts = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { category, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: "i" };

    const results = await Product.find(query)
      .limit(Math.min(limit, 50))
      .skip((page - 1) * limit);

    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
};
