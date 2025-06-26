// const express = require("express");
// const { signup, login } = require("../controllers/authController");
import express from "express";
import { signup, login } from "../controllers/authController.js";
import User from "../services/mongodb/models/User.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import isAdmin from "../middlewares/isAdmin.js";
import { body, validationResult } from "express-validator";
//the body gives access to the body

const router = express.Router()

/*
type : GET REQUEST
path : /api/v1/auth/users
query - params : none
isProtected : true (admin can access this )
*/

// router.get('/users', isAdmin, async (req, res) => {
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

// router.post('/signup',
//     body('firstName').isLength({ min: 4 }),
//     body('email').isEmail(),
//     body('password').isLength({ min: 2 })
//     , async (req, res) => {

//         const { errors } = validationResult(req)

//         if (errors.length > 0) return res.status(403).json({ errors, message: "BAD REQUEST" })

//         try {
//             const { firstName, lastName = '', email, password } = req.body

//             //USE bcrypt to hash password
//             const salt = await bcrypt.genSalt(5)
//             const hashedPassword = await bcrypt.hash(password, salt)

//             const user = new User({ firstName, lastName, email, password: hashedPassword })
//             // console.log(hashedPassword)

//             //save the user 
//             await user.save()
//             res.status(200).json({ user })
//         } catch (error) {
//             console.log(error.message)
//             res.status(500).json({ users: {} })
//         }
//     })

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

// router.post('/login', async (req, res) => {
//     try {
//         const { email, password } = req.body

//         //find the user
//         const user = await User.findOne({ email }) //authentication
//         if (user) {                         // is authorizing
//             const isVerified = await bcrypt.compare(password, user.password)

//             if (isVerified) {
//                 const { _id, role } = user
//                 const token = jwt.sign({ _id, role }, process.env.JWT_SECRET, { expiresIn: "1h" })
//                 return res.json({ token })
//             } else {
//                 return res.json({ token: null, message: "UNAUTHORISED" })
//             }
//         }

//         return res.json({ token: null, message: "USER DOESN'T EXISTS" })

//     } catch (error) {
//         console.log(error.message)
//         res.status(500).json({ token: null })
//     }
// })
router.post("/login", login);

export default router