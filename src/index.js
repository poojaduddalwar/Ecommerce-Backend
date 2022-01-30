import express from "express";
import dotenv from 'dotenv';
import connectDB from './services/mongodb/connectDB';
import cors from 'cors';
import authRoutes from './routes/authRoutes';

dotenv.config()

const app = express()
const port = process.env.PORT || 3003

connectDB()

//middlewares
app.use(cors())
app.use(express.json())

//route to handle auth requests 
app.use("/api/v1/auth", authRoutes)//this takes care of our auth routes
//adding api/v1 is just a convention . your api route should start with /api and then since its the version 1 we'll add v1 and then we have route


app.listen(port, (req, res) => {
    console.log(`Server listening at PORT ${port}`)
})