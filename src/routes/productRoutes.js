import express from "express";
import Product from '../services/mongodb/models/Product';
import Category from '../services/mongodb/models/Category';
import { body, validationResult } from "express-validator";

const router = express.Router()

/*
type : GET REQUEST
path : /api/v1/product/all
query - params : none
isProtected : false (public route)
*/

router.get('/all', async (req, res) => {
    try {
        const products = await Product.find({}).populate('category')
        res.status(200).json({ products, message: "Successfully fetched products" })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ products: [], message: "Error fetching products" })
    }
})

//route to get product by its category itself 
/*
type : GET REQUEST
path : /api/v1/product/all
params : none
query : categoryID
isProtected : false (public route)
*/

router.get('/all', async (req, res) => {
    try {
        const { categoryId } = req.query
        const products = await Product.find({ category: categoryId })
        res.status(200).json({ products, message: "Successfully fetched products" })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ products: [], message: "Error fetching products" })
    }
})


/*
type : POST REQUEST
path : /api/v1/product/add
query - params : none
isProtected : private (admin route)
*/

router.post('/add',
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


router.put('/update/:id'
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

router.delete('/delete/:id'
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

// router.put('/updateStock/:id'
//     , async (req, res) => {
//         const { id } = req.params

//         try {

//             if (req.body.category) {
//                 const category = await Category.findById(req.body.category)
//                 if (!category) return res.status(300).json({ product: null, message: "Invalid Category" })
//             }
//             const product = await Product.findOneAndUpdate({ _id: id }, req.body, { new: true })

//             res.status(200).json({ product, message: "Successfully updated a product" })

//         } catch (error) {
//             console.log(error.message)
//             res.status(500).json({ product: null, message: "Error updating product" })
//         }
//     })

export default router