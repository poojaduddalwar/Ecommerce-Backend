import express from "express";
import Category from "../services/mongodb/models/Category";
import { body, validationResult } from "express-validator";

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
        res.status(200).json({ category, message: "Successfully  fetched categories" })
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

router.post('/add',
    body('name').isLength({ min: 1 }),
    body('description').isLength({ min: 10 })
    , async (req, res) => {
        const { errors } = validationResult(req)

        if (errors.length > 0) return res.status(403).json({ errors, message: "BAD REQUEST" })

        try {
            // const { name, description } = req.body
            const category = new Category(req.body)
            await category.save()

            res.status(200).json({ category, message: "Successfully added a category" })

        } catch (error) {
            // console.log(error.message)
            res.status(500).json({ category: null, message: "Error adding category" })
        }
    })


/*
type : PUT REQUEST
path : /api/v1/category/update/:id
query - params : none
isProtected : private (admin route)
*/

router.put('/update/:id'
    , async (req, res) => {
        const { id } = req.params

        try {
            const category = await Category.findOneAndUpdate({ _id: id }, req.body, { new: true })

            res.status(200).json({ category, message: "Successfully updated a category" })

        } catch (error) {
            console.log(error.message)
            res.status(500).json({ category: null, message: "Error updating category" })
        }
    })

/*
type : DELETE REQUEST
path : /api/v1/category/delete/:id
query - params : none
isProtected : private (admin route)
*/

router.delete('/delete/:id'
    , async (req, res) => {
        const { id } = req.params

        try {
            const category = await Category.findByIdAndRemove(id)

            res.status(200).json({ category, message: "Successfully deleted a category" })

        } catch (error) {
            console.log(error.message)
            res.status(500).json({ category: null, message: "Error deleting category" })
        }
    })

export default router