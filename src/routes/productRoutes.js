import express from "express";
import Product from '../services/mongodb/models/Product.js';
import Category from '../services/mongodb/models/Category.js';
import { body, query, validationResult } from "express-validator";
import authMiddleware from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/isAdmin.js';
import { generateProductDescription } from '../services/utils/openaiUtils.js';

const router = express.Router();

// ✅ GET /api/v1/product/all with filters, pagination, sorting
router.get(
  "/all",
  [
    query("limit").optional().isInt({ min: 1, max: 50 }),
    query("page").optional().isInt({ min: 1 }),
    query("search").optional().trim().escape(),
    query("category").optional().trim().escape(),
    query("sortBy").optional().isIn(["price", "name", "createdAt"]),
    query("order").optional().isIn(["asc", "desc"]),
    query("minPrice").optional().isFloat({ min: 0 }),
    query("maxPrice").optional().isFloat({ min: 0 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), message: "Invalid query parameters" });
    }

    try {
      const {
        search = "",
        category,
        minPrice,
        maxPrice,
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        order = "desc"
      } = req.query;

      const query = {};

      if (search) query.name = { $regex: search, $options: 'i' };
      if (category) query.category = category;

      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sortOption = {};
      sortOption[sortBy] = order === "asc" ? 1 : -1;

      const products = await Product.find(query)
        .populate('category')
        .skip(skip)
        .limit(parseInt(limit))
        .sort(sortOption);

      const total = await Product.countDocuments(query);

      res.status(200).json({
        products,
        total,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        message: "Successfully fetched products"
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ products: [], message: "Error fetching products" });
    }
  }
);

// ✅ POST /api/v1/product/add
router.post(
  '/add',
  authMiddleware,
  isAdmin,
  body('name').isLength({ min: 1 }),
  body('price').isNumeric(),
  body('listPrice').isNumeric(),
  body('color').isLength({ min: 1 }),
  body('compatibleWith').isLength({ min: 1 }),
  body('category').isLength({ min: 5 }),
  body('imageUrl').isURL(),
  body('stock').isNumeric(),
  async (req, res) => {
    const { errors } = validationResult(req);
    if (errors.length > 0) {
      return res.status(403).json({ errors, message: 'BAD REQUEST, VALIDATION FAILED' });
    }

    try {
      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(400).json({ product: null, message: 'Invalid Category' });
      }

      // 👇 Auto-generate description if not provided
      if (!req.body.description) {
        req.body.description = await generateProductDescription({
          name: req.body.name,
          category: category.name || 'Electronics',
          color: req.body.color,
          compatibleWith: req.body.compatibleWith
        });
      }

      const product = new Product(req.body);
      await product.save();

      res.status(200).json({ product, message: 'Successfully added a product' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ product: null, message: 'Error adding product' });
    }
  }
);

// ✅ PUT /api/v1/product/update/:id
router.put('/update/:id', authMiddleware, isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category) return res.status(300).json({ product: null, message: "Invalid Category" });
    }
    const product = await Product.findOneAndUpdate({ _id: id }, req.body, { new: true });
    res.status(200).json({ product, message: "Successfully updated a product" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ product: null, message: "Error updating product" });
  }
});

// ✅ DELETE /api/v1/product/delete/:id
router.delete('/delete/:id', authMiddleware, isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByIdAndRemove(id);
    res.status(200).json({ product, message: "Successfully deleted a product" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ product: null, message: "Error deleting product" });
  }
});

// ✅ PUT /api/v1/product/updateStock/:id
router.put('/updateStock/:id', authMiddleware, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByIdAndUpdate(
      id,
      { $set: { stock: req.body.stock } },
      { new: true }
    );
    res.status(200).json({ product, message: "Stock updated successfully" });
  } catch (err) {
    res.status(500).json({ product: null, message: "Failed to update stock" });
  }
});

export default router;