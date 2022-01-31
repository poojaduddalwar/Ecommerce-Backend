import express from "express";
import dotenv from 'dotenv';
import connectDB from './services/mongodb/connectDB';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';

dotenv.config()

const app = express()
const port = process.env.PORT || 3003

connectDB()

//middlewares
app.use(cors())
app.use(express.json())

//route to handle auth requests 
app.use("/api/v1/auth", authRoutes)//this takes care of our auth routes
app.use("/api/v1/category", categoryRoutes)//this takes care of our category  routes


app.listen(port, (req, res) => {
    console.log(`Server listening at PORT ${port}`)
})