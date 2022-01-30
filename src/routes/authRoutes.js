import express from "express";
import User from "../services/mongodb/models/User";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import isAdmin from "../middlewares/isAdmin";

const router = express.Router()

/*
type : GET REQUEST
path : /api/v1/auth/users
query - params : none
isProtected : true (admin can access this )
*/

//this is just a route that gets all of the users for you.
//this is going to be a route for admin user so that he/she can take look at all the users that have signed up 
router.get('/users', isAdmin, async (req, res) => {
    try {
        const users = await User.find({})
        res.json({ users })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ users: [] })
    }
})
//if the api request fails for some reason we'll send an empty array


/*
type : POST REQUEST
path : /api/v1/auth/signup
query - params : none
isProtected : false
*/

router.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName = '', email, password } = req.body

        //USE bcrypt to hash password
        const salt = await bcrypt.genSalt(5)
        const hashedPassword = await bcrypt.hash(password, salt)

        const user = new User({ firstName, lastName, email, password: hashedPassword })
        // console.log(hashedPassword)

        //save the user 
        await user.save()
        res.json({ user })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ users: {} })
    }
})


/*
type : POST REQUEST
path : /api/v1/auth/login
query - params : none
isProtected : false
*/

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        //find the user
        const user = await User.findOne({ email }) //authentication
        if (user) {                         // is authorizing
            const isVerified = await bcrypt.compare(password, user.password)
            //bcrypt.compare() Asynchronously compares the given data (password) against the given hash.

            if (isVerified) {
                const { _id, role } = user
                const token = jwt.sign({ _id, role }, process.env.JWT_SECRET, { expiresIn: "1h" })
                return res.json({ token })
            } else {
                return res.json({ token: null, message: "UNAUTHORISED" })
            }
        }

        return res.json({ token: null, message: "USER DOESN'T EXISTS" })

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ token: null })
    }
})

export default router