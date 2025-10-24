import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import { sql } from "./config/db.js";
import { aj } from "./lib/arcjet.js";
import path from "path";

import productRoutes from "./routes/product.routes.js";

dotenv.config({ quiet: true });

const app = express();
const PORT = process.env.PORT;
const __dirname = path.resolve();

app.set("trust proxy", 1);
app.use(express.json());
app.use(cors());
app.use(
  //
  helmet({
    contentSecurityPolicy: false,
  })
); // Security middleware
app.use(morgan("dev"));

// apply arcjet rate-limit to all routes
app.use(async (req, res, next) => {
  try {
    const decision = await aj.protect(req, {
      requested: 1, // specifies that each request consumes 1 token
    });
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        res.status(429).json({
          error: "Too many requests",
        });
      } else if (decision.reason.isBot()) {
        res.status(403).json({
          error: "Bot access denied",
        });
      } else {
        res.status(403).json({ error: "Forbidden" });
      }
      return;
    }

    // check for spoofed bots
    if (
      decision.results.some(
        (result) => result.reason.isBot() && result.reason.isSpoofed()
      )
    ) {
      res.status(403).json({
        error: "Spoofed bot detected",
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Arcjet middleware error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.use("/api/products", productRoutes);

// après app.use("/api/products", productRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend/dist")));

  // Catch-all pour SPA, en excluant /api/*
  app.get(/^(?!\/api\/).*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

async function initDB() {
  try {
    await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      image VARCHAR(255) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    console.log("Database initialized successfully");
  } catch (error) {
    console.log("Database connection error:", error);
  }
}

initDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
  });
});
