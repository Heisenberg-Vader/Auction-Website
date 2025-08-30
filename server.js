import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import nodemailer from "nodemailer";
import crypto from "crypto";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss";

dotenv.config();

const app = express();

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later."
});
app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many authentication attempts, please try again later."
});

app.use(express.json({ limit: '10mb' }));
app.use(mongoSanitize());

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return xss(input.trim());
  }
  return input;
};

const jwtToken = process.env.JWT_SECRET || "somekey";

if (!process.env.JWT_SECRET) {
  console.warn("WARNING: Using default JWT secret. Set JWT_SECRET in .env file!");
}

mongoose
  .connect("mongodb://127.0.0.1:27017/auctionDB", {})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const UserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { type: String, required: true, minlength: 6 },
  userType: { 
    type: String, 
    required: true, 
    enum: ['buyer', 'seller', 'admin']
  },
  verified: { type: Boolean, default: false },
  verificationToken: { type: String },
  isLoggedIn: { type: Boolean, default: false },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date
});

UserSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
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
    to: sanitizeInput(email),
    subject: "Email Verification - Auction Website",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Email Verification</h2>
        <p>Thank you for registering! Please click the button below to verify your email:</p>
        <a href="${verificationLink}" 
           style="background-color: #007bff; color: white; padding: 10px 20px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email
        </a>
        <p><small>This link will expire in 24 hours.</small></p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent");
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

app.use(['/register', '/login'], authLimiter);

app.post("/register", async (req, res) => {
  try {
    const { email, password, userType } = req.body;
    
    if (!email || !password || !userType) {
      return res.status(400).json({ error: "All fields are required!" });
    }
    
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedUserType = sanitizeInput(userType);
    
    const validUserTypes = ['buyer', 'seller', 'admin'];
    if (!validUserTypes.includes(sanitizedUserType)) {
      return res.status(400).json({ error: "Invalid user type!" });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long!" });
    }
    
    const existingUser = await User.findOne({ email: sanitizedEmail.toLowerCase() });
    if (existingUser) return res.status(400).json({ error: "User already exists!" });

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = new User({ 
      email: sanitizedEmail, 
      password: hashedPassword, 
      userType: sanitizedUserType, 
      verificationToken 
    });
    await newUser.save();
    
    const emailSent = await sendVerificationEmail(sanitizedEmail, verificationToken);
    
    if (emailSent) {
      res.status(201).json({ message: "User registered! Check email to verify." });
    } else {
      res.status(201).json({ 
        message: "User registered, but email verification failed. Please contact support.",
        warning: "Email service temporarily unavailable"
      });
    }
  } catch (error) {
    console.log("Registration error:", error);
    res.status(500).json({ error: "Internal server error!" });
  }
});

app.get("/verify", async (req, res) => {
  try {
    const { token } = req.query;
    
    const sanitizedToken = sanitizeInput(token);
    
    if (!sanitizedToken) {
      return res.redirect("http://localhost:5173/verify?status=failed");
    }
    
    const user = await User.findOne({ verificationToken: sanitizedToken });

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
    
    if (!email || !password || !userType) {
      return res.status(400).json({ error: "All fields are required!" });
    }
    
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedUserType = sanitizeInput(userType);
    
    const user = await User.findOne({ email: sanitizedEmail.toLowerCase() });

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials!" });
    }
    
    if (user.isLocked) {
      return res.status(423).json({ error: "Account temporarily locked due to too many failed attempts!" });
    }
    
    if (!user.verified) {
      return res.status(400).json({ error: "Please verify your email before logging in!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 30 * 60 * 1000;
      }
      await user.save();
      return res.status(400).json({ error: "Invalid credentials!" });
    }
    
    if (sanitizedUserType !== user.userType) {
      return res.status(400).json({ error: "Invalid user type!" });
    }

    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.isLoggedIn = true;
    await user.save();

    const token = jwt.sign({ id: user._id, userType: user.userType }, jwtToken || "somekey", { expiresIn: "1h" });

    res.json({ message: "Login successful!", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error!" });
  }
});

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: Token missing" });
    }

    const decoded = jwt.verify(token, jwtToken);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

app.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
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
    console.error("User fetch error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/logout", verifyToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { isLoggedIn: false });

    if (!user) {
      return res.status(400).json({ error: "User not found!" });
    }

    res.json({ message: "Logged out successfully!" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));