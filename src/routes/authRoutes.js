import express from "express";
import { signup, login } from "../controllers/authController.js";
import User from "../services/mongodb/models/User.js";
import { body } from "express-validator";

const router = express.Router()

/*
type : GET REQUEST
path : /api/v1/auth/users
query - params : none
isProtected : true (admin can access this )
*/

router.get('/users', async (req, res) => {
    try {
        const users = await User.find({})
        res.status(200).json({ users, message: "Successfully  fetched users" })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ users: [], message: "Error fetching users" })
    }
})

/*
type : POST REQUEST
path : /api/v1/auth/signup
query - params : none
isProtected : false
*/

router.post("/signup", [
    body("name").isLength({ min: 2 }).withMessage("Full name is too short"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
], signup);


/*
type : POST REQUEST
path : /api/v1/auth/login
query - params : none
isProtected : false
*/

router.post("/login", login);

export default router