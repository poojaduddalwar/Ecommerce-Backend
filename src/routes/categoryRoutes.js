import express from "express";
import Category from "../services/mongodb/models/Category.js";
import { body, validationResult } from "express-validator";
import authMiddleware from "../middlewares/authMiddleware.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = express.Router()

/*
type : GET REQUEST
path : /api/v1/category/all
query - params : none
isProtected : false (public route)
*/

router.get('/all', async (req, res) => {
    try {
        const category = await Category.find({})
        res.status(200).json({ category, message: "Successfully fetched categories" })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ category: [], message: "Error fetching categories" })
    }
})

/*
type : POST REQUEST
path : /api/v1/category/add
query - params : none
isProtected : private (admin route)
*/

router.post(
    "/add",
    authMiddleware,
    isAdmin,
    [
        body("name", "Category name is required").isLength({ min: 1 }),
        body("description", "Description must be at least 10 characters").isLength({ min: 10 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), message: "Validation failed" });
        }

        try {
            const { name, description } = req.body;

            // Check if category with same name already exists (optional)
            const existingCategory = await Category.findOne({ name });
            if (existingCategory) {
                return res.status(409).json({ message: "Category already exists" });
            }

            const category = new Category({ name, description });
            await category.save();

            res.status(201).json({ category, message: "Successfully added a category" });
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ category: null, message: "Error adding category" });
        }
    }
);


/*
type : PUT REQUEST
path : /api/v1/category/update/:id
query - params : none
isProtected : private (admin route)
*/

router.put(
    "/update/:id",
    authMiddleware,
    isAdmin,
    [
        body("name", "Category name must be at least 1 character").optional().isLength({ min: 1 }),
        body("description", "Description must be at least 10 characters").optional().isLength({ min: 10 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), message: "Validation failed" });
        }

        const { id } = req.params;

        try {
            const category = await Category.findByIdAndUpdate(id, req.body, { new: true });

            if (!category) {
                return res.status(404).json({ category: null, message: "Category not found" });
            }

            res.status(200).json({ category, message: "Successfully updated the category" });
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ category: null, message: "Error updating category" });
        }
    }
);


/*
type : DELETE REQUEST
path : /api/v1/category/delete/:id
query - params : none
isProtected : private (admin route)
*/

router.delete(
    "/delete/:id",
    authMiddleware,
    isAdmin,
    async (req, res) => {
        const { id } = req.params;

        try {
            const category = await Category.findByIdAndDelete(id);

            if (!category) {
                return res.status(404).json({ category: null, message: "Category not found" });
            }

            res.status(200).json({ category, message: "Successfully deleted the category" });
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ category: null, message: "Error deleting category" });
        }
    }
);

export default router