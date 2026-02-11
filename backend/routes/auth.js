import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import verifyToken, { jwtSecret } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { sanitizeInput } from "../middleware/sanitize.js";
import sendVerificationEmail from "../utils/email.js";

const router = express.Router();

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 1000
};

router.use(['/register', '/login'], authLimiter);

router.post("/register", async (req, res) => {
    try {
        const { email, password, userType } = req.body;

        if (!email || !password || !userType) {
            return res.status(400).json({ error: "All fields are required!" });
        }

        const sanitizedEmail = sanitizeInput(email);
        const sanitizedUserType = sanitizeInput(userType);

        const validUserTypes = ['buyer', 'seller', 'admin', 'client'];
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
        console.error("Registration error:", error);
        res.status(500).json({ error: "Internal server error!" });
    }
});

router.get("/verify", async (req, res) => {
    try {
        const { token } = req.query;
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

        const sanitizedToken = sanitizeInput(token);

        if (!sanitizedToken) {
            return res.redirect(`${frontendUrl}/verify?status=failed`);
        }

        const user = await User.findOne({ verificationToken: sanitizedToken });

        if (!user) {
            return res.redirect(`${frontendUrl}/verify?status=failed`);
        }

        user.verified = true;
        user.verificationToken = null;
        await user.save();

        res.redirect(`${frontendUrl}/verify?status=success`);
    } catch (error) {
        console.error("Verification error:", error);
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        res.redirect(`${frontendUrl}/verify?status=failed`);
    }
});

router.post("/login", async (req, res) => {
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

        const token = jwt.sign({ id: user._id, userType: user.userType }, jwtSecret, { expiresIn: "1h" });

        res.cookie("token", token, COOKIE_OPTIONS);
        res.json({ message: "Login successful!" });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error!" });
    }
});

router.get("/me", verifyToken, async (req, res) => {
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

router.post("/logout", verifyToken, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user.id, { isLoggedIn: false });

        if (!user) {
            return res.status(400).json({ error: "User not found!" });
        }

        res.clearCookie("token", COOKIE_OPTIONS);
        res.json({ message: "Logged out successfully!" });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
