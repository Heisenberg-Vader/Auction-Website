import dotenv from "dotenv";
import express from "express";
import https from "https";
import fs from "fs";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import { limiter } from "./middleware/rateLimiter.js";
import { generateCsrfToken, validateCsrf } from "./middleware/csrf.js";
import authRoutes from "./routes/auth.js";

dotenv.config({ path: '../.env' });

if (!process.env.JWT_SECRET) {
  console.warn("WARNING: Using default JWT secret. Set JWT_SECRET in .env file!");
}

const app = express();

const corsOptions = {
  origin: ['https://localhost:5173', 'https://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

connectDB();

app.get("/csrf-token", generateCsrfToken);
app.use(validateCsrf);
app.use(authRoutes);

const PORT = process.env.PORT || 5000;

const sslOptions = {
  key: fs.readFileSync("./certs/key.pem"),
  cert: fs.readFileSync("./certs/cert.pem")
};

https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`HTTPS Server running on https://localhost:${PORT}`);
});