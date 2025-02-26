import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import nodemailer from "nodemailer";
import crypto from "crypto";

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
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  userType: { type: String, required: true },
  verified: { type: Boolean, default: false },
  verificationToken: { type: String },
});

const User = mongoose.model("User", UserSchema);

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "noreply.auctionquiz@gmail.com",
    pass: process.env.EMAIL_PASS,
  },
});

// Send email verification
const sendVerificationEmail = async (email, token) => {
  const verificationLink = `http://localhost:5000/verify?token=${token}`;

  const mailOptions = {
    from: "noreply.auctionquiz@gmail.com",
    to: email,
    subject: "Email Verification",
    text: `Click the link to verify your email: ${verificationLink}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// Register route with email verification
app.post("/register", async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = new User({
      email,
      password: hashedPassword,
      userType,
      verified: false,
      verificationToken,
    });

    await newUser.save();
    sendVerificationEmail(email, verificationToken);

    return res.status(201).json({ message: "User registered! Check email to verify." });
  } catch (error) {
    console.log("Registration error:", error);
    return res.status(500).json({ error: "Internal server error!" });
  }
});

// Email verification route
app.get("/verify", async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.redirect("http://localhost:5173/verify?status=failed");
    }

    user.verified = true;
    user.verificationToken = null;
    await user.save();

    return res.redirect("http://localhost:5173/verify?status=success");
  } catch (error) {
    console.error("Verification error:", error);
    return res.redirect("http://localhost:5173/verify?status=failed");
  }
});

// Login route with verification check
app.post("/login", async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: "User not found!" });
    }

    if (!user.verified) {
      return res.status(400).json({ error: "Please verify your email before logging in!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password!" });
    }

    if (userType !== user.userType) {
      return res.status(400).json({ error: "Invalid user type!" });
    }

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

// /me endpoint to verify user session from token
app.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Return user info (you can choose which fields to return)
    res.json({
      email: user.email,
      userType: user.userType,
      verified: user.verified,
    });
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
