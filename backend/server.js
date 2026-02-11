import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./config/db.js";
import { limiter } from "./middleware/rateLimiter.js";
import authRoutes from "./routes/auth.js";

dotenv.config({ path: '../.env' });

if (!process.env.JWT_SECRET) {
  console.warn("WARNING: Using default JWT secret. Set JWT_SECRET in .env file!");
}

const app = express();

const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));

connectDB();

app.use(authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));