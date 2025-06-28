import express from "express";
import dotenv from 'dotenv';
import connectDB from './services/mongodb/connectDB.js';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js'
import cartRoutes from './routes/cartRoutes.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 3003

//middlewares
app.use(cors())
app.use(express.json())

//route to handle auth requests 
app.use("/api/v1/auth", authRoutes)//this takes care of our auth routes
app.use("/api/v1/category", categoryRoutes)//this takes care of our category  routes
app.use("/api/v1/product", productRoutes)//this takes care of our product  routes
app.use("/api/v1/cart", cartRoutes);//this takes care of cart routes
app.use("/api/v1/order", orderRoutes)//this takes care of our order routes

app.get('/', (req, res) => {
    res.send(`server running at ${port} {deployed and running}`)
})  //this is just to see server is running

const startServer = async () => {
    try {
        await connectDB(); // Wait for DB connection
        app.listen(port, () => {
            console.log(`✅ Server listening at PORT: ${port}`);
        });
    } catch (err) {
        console.error("❌ Failed to start the server:", err.message);
        process.exit(1); // Exit process if DB fails
    }
};

startServer();