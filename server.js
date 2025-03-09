import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import nodemailer from "nodemailer";
import crypto from "crypto";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose
  .connect("mongodb://127.0.0.1:27017/auctionDB", {})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  userType: { type: String, required: true },
  verified: { type: Boolean, default: false },
  verificationToken: { type: String },
  isLoggedIn: { type: Boolean, default: false },
});

const User = mongoose.model("User", UserSchema);

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERV,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (email, token) => {
  const verificationLink = `http://localhost:5000/verify?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Email Verification",
    text: `Click the link to verify your email: ${verificationLink}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

app.post("/register", async (req, res) => {
  try {
    const { email, password, userType } = req.body;
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(400).json({ error: "User already exists!" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = new User({ email, password: hashedPassword, userType, verificationToken });
    await newUser.save();
    sendVerificationEmail(email, verificationToken);

    res.status(201).json({ message: "User registered! Check email to verify." });
  } catch (error) {
    console.log("Registration error:", error);
    res.status(500).json({ error: "Internal server error!" });
  }
});

app.get("/verify", async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ verificationToken: token });

    if (!user){
      return res.redirect("http://localhost:5173/verify?status=failed");
    }

    user.verified = true;
    user.verificationToken = null;
    await user.save();

    res.redirect("http://localhost:5173/verify?status=success");
  } catch (error) {
    console.error("Verification error:", error);
    res.redirect("http://localhost:5173/verify?status=failed");
  }
});

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

    user.isLoggedIn = true;
    await user.save();

    const token = jwt.sign({ id: user._id, userType: user.userType }, process.env.JWT_SECRET || "somekey", { expiresIn: "1h" });

    res.json({ message: "Login successful!", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error!" });
  }
});

// User Data Endpoint (Keeps isLoggedIn)
app.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized: No token provided" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.isLoggedIn) {
      return res.status(401).json({ error: "Session expired. Please login again." });
    }

    res.json({ email: user.email, userType: user.userType, verified: user.verified, isLoggedIn: user.isLoggedIn });
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
});// Endpoint to verify user session from token
app.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: Token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "somekey");
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.isLoggedIn) {
      return res.status(401).json({ error: "Session expired. Please login again." });
    }

    res.json({
      email: user.email,
      userType: user.userType,
      verified: user.verified,
      isLoggedIn: user.isLoggedIn,
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

// Logout Route (Clears isLoggedIn status)
app.post("/logout", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: Token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "somekey");
    const user = await User.findByIdAndUpdate(decoded.id, { isLoggedIn: false });

    if (!user) {
      return res.status(400).json({ error: "User not found!" });
    }

    res.json({ message: "Logged out successfully!" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

// Logout Route
app.post("/logout", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOneAndUpdate({ email: email.toLowerCase() }, { isLoggedIn: false });

    if (!user) {
      return res.status(400).json({ error: "User not found!" });
    }

    res.json({ message: "Logged out successfully!" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error!" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
