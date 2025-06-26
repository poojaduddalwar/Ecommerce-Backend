// create-admin.js

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import connectDB from "./src/services/mongodb/connectDB.js"; // Make sure it has .js extension
import User from "./src/services/mongodb/models/User.js";     // Also needs .js extension

dotenv.config();

await connectDB();

try {
  const adminExists = await User.findOne({ email: "admin@example.com" });
  if (adminExists) {
    console.log("✅ Admin already exists");
    process.exit();
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = new User({
    name: "Admin",
    email: "admin@example.com",
    password: hashedPassword,
    role: "admin",
  });

  await admin.save();
  console.log("✅ Admin created successfully");
  process.exit();
} catch (error) {
  console.error("❌ Error creating admin:", error);
  process.exit(1);
}
