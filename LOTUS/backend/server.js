// server.js
// Entry point. Keeps the API key safe on the backend (never expose it to the browser).

// server.js
import "dotenv/config";

import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { getAIResponse } from "./brain.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  const userText = req.body.text;

  if (!userText || typeof userText !== "string") {
    return res.status(400).json({ error: "Missing 'text' in request body." });
  }

  const reply = await getAIResponse(userText);
  res.json({ reply });
});

app.get("/health", (req, res) => {
  res.json({ status: "LOTUS backend is running." });
});

app.listen(config.server.port, () => {
  console.log(`LOTUS backend running at http://localhost:${config.server.port}`);
});