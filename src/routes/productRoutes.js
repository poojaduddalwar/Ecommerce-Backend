import express from "express";
import Product from '../services/mongodb/models/Product.js';
import Category from '../services/mongodb/models/Category.js';
import { body, validationResult } from "express-validator";
import authMiddleware from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/isAdmin.js'

const router = express.Router()

/*
type : GET REQUEST
path : /api/v1/product/all
query - params : none
isProtected : false (public route)
*/
// GET /api/v1/product/all 
// Example Requests for Testing:
// Search and sort by price ascending = /api/v1/product/all?search=keyboard&sortBy=price&order=asc
// Get products sorted by name (A → Z) = /api/v1/product/all?sortBy=name&order=asc
// Newest products first (default) = /api/v1/product/all

router.get('/all', async (req, res) => {
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

        // 🔍 Search by product name
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        // 📂 Filter by category
        if (category) {
            query.category = category;
        }

        // 💸 Filter by price range
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        // 🧾 Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // 📊 Sorting logic
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
});


/*
type : POST REQUEST
path : /api/v1/product/add
query - params : none
isProtected : private (admin route)
*/

router.post('/add', authMiddleware, isAdmin, 
    body('name').isLength({ min: 1 }),
    body('price').isNumeric(),
    body('listPrice').isNumeric(),
    body('description').isLength({ min: 5 }),
    body('color').isLength({ min: 1 }),
    body('compatibleWith').isLength({ min: 1 }),
    body('category').isLength({ min: 5 }),
    body('imageUrl').isURL(),
    body('stock').isNumeric()
    , async (req, res) => {
        const { errors } = validationResult(req)

        if (errors.length > 0) return res.status(403).json({ errors, message: "BAD REQUEST , VALIDATION FAILED" })

        try {
            //check if the category is valid/ if it exixts
            const category = await Category.findById(req.body.category)
            if (!category) return res.status(300).json({ product: null, message: "Invalid Category" })

            const product = new Product(req.body)
            await product.save()

            res.status(200).json({ product, message: "Successfully added a product" })

        } catch (error) {
            return res.status(500).json({ product: null, message: "Error adding product" })
        }
    })


/*
type : PUT REQUEST
path : /api/v1/product/update/:id
query - params : id
isProtected : private (admin route)
*/


router.put('/update/:id', authMiddleware, isAdmin
    , async (req, res) => {
        const { id } = req.params

        try {

            if (req.body.category) {
                const category = await Category.findById(req.body.category)
                if (!category) return res.status(300).json({ product: null, message: "Invalid Category" })
            }
            const product = await Product.findOneAndUpdate({ _id: id }, req.body, { new: true })

            res.status(200).json({ product, message: "Successfully updated a product" })

        } catch (error) {
            console.log(error.message)
            res.status(500).json({ product: null, message: "Error updating product" })
        }
    })


/*
type : DELETE REQUEST
path : /api/v1/product/delete/:id
query - params : id
isProtected : private (admin route)
*/

router.delete('/delete/:id', authMiddleware, isAdmin
    , async (req, res) => {
        const { id } = req.params

        try {
            const product = await Product.findByIdAndRemove(id)

            res.status(200).json({ product, message: "Successfully deleted a product" })

        } catch (error) {
            console.log(error.message)
            res.status(500).json({ product: null, message: "Error deleting product" })
        }
    })


/*
type : PUT REQUEST
path : /api/v1/product/updateStock/:id
query - params : id
isProtected : private (admin route)
*/

router.put('/updateStock/:id', authMiddleware, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByIdAndUpdate(id, {
      $set: { stock: req.body.stock }
    }, { new: true });

    res.status(200).json({ product, message: "Stock updated successfully" });
  } catch (err) {
    res.status(500).json({ product: null, message: "Failed to update stock" });
  }
});


export default router