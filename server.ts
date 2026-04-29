/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import rateLimit from "express-rate-limit";
import { MOCK_MOMS } from "./src/data.ts";
import { CATALOG } from "./src/catalog.ts";
import { analyzeMom } from "./src/services/geminiService.ts";
import { getUserState, updateUserState, detectTransition } from "./src/services/stateManager.ts";
import { buildIndex } from "./src/services/ragService.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 50, // allow 50 requests per minute
    message: { error: "Too many requests, please slow down." }
  });
  app.use("/api/", limiter);

  // Health Check for Cloud Run
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
  });

  // API Routes
  app.get("/api/moms", (req, res) => {
    const list = MOCK_MOMS.map((m) => ({ id: m.id, name: m.name }));
    res.json(list);
  });

  app.get("/api/catalog", (req, res) => {
    res.json(CATALOG);
  });

  app.get("/api/debug-env", (req, res) => {
    const key = process.env.GEMINI_API_KEY;
    res.json({
      hasKey: !!key,
      keyLength: key ? key.length : 0,
      isPlaceholder: key === "MY_GEMINI_API_KEY" || (key?.includes("your_key") ?? false),
      prefix: key ? key.substring(0, 4) : "none"
    });
  });

  // Protected Analyze Route
  app.post("/api/analyze", async (req, res) => {
    const { momId } = req.body;
    
    // Optional internal API key check (enabled if INTERNAL_API_KEY is set)
    const internalKey = process.env.INTERNAL_API_KEY;
    if (internalKey && req.headers["x-api-key"] !== internalKey) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const mom = MOCK_MOMS.find((m) => m.id === momId);
    if (!mom) return res.status(404).json({ error: "Mom not found" });

    try {
      const prevState = getUserState(mom.id);
      const result = await analyzeMom(mom);
      
      const transitionNote = detectTransition(prevState, result.baby_stage);
      if (transitionNote) {
        result.confidence_reason = `${transitionNote}. ${result.confidence_reason}`;
      }

      // Progressive Intelligence Filtering
      const conf = result.stage_confidence;
      if (conf === "low") {
        result.recommendations = result.recommendations.slice(0, 1);
        result.message_en += " (We're still learning about your journey, more tips coming soon!)";
      } else if (conf === "medium") {
        result.recommendations = result.recommendations.slice(0, 2);
      }

      updateUserState(mom.id, result.baby_stage, conf);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Pre-build RAG index on startup
  buildIndex().catch(err => console.error("!!! RAG Index building failed on startup:", err));

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`>>> Server Starting...`);
    console.log(`>>> Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`>>> Port: ${PORT}`);
    console.log(`>>> Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("!!! CRITICAL: Failed to start server:", err);
  process.exit(1);
});

