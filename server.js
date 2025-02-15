import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";

dotenv.config(); // Load environment variables

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/auctionDB", {})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// User schema and model
const UserSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true, lowercase: true},
  password: { type: String, required: true },
  userType: { type: String, required: true },
});

const User = mongoose.model("User", UserSchema);

app.post("/register", async(req, res) => {
  try {
    const {email, password, userType} = req.body;

    const existingUser = await user.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error:"User already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
      userType,
    })

    await newUser.save();
    res.status(201).json({ message:"User registered succesfully!" });
  } catch (error) {
    console.log("Registration error: ", error);
    return res.status(500).json({ error:"Internal server error!" });
  }
});

// Login route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(email, password);
    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log("User found:", user);

    if (!user) {
      return res.status(400).json({ error: "User not found!" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password!" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, userType: user.userType },
      process.env.JWT_SECRET || "somekey",
      { expiresIn: "1h" }
    );

    return res.json({ message: "Login successful!", token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error!" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
