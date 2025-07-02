import express from "express";
import { signup, login } from "../controllers/authController.js";
import User from "../services/mongodb/models/User.js";
import authMiddleware from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/isAdmin.js';
import loginLimiter from '../middlewares/rateLimiter.js';

const router = express.Router()

/*
type : GET REQUEST
path : /api/v1/auth/users
query - params : none
isProtected : true (admin can access this )
*/

router.get('/users', authMiddleware, isAdmin, async (req, res) => {
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

router.post("/signup", signup);

/*
type : POST REQUEST
path : /api/v1/auth/login
query - params : none
isProtected : false
*/

router.post("/login", loginLimiter, login);

export default router