// brain.js
// This is LOTUS's "brain". Right now it only knows how to talk to Gemini.
// LATER: this file can become a folder (brain/gemini.js, brain/ollama.js, etc.)
// with an index.js that picks one based on config.js — nothing outside
// this file needs to change when that happens.

import { config } from "./config.js";

const SYSTEM_PERSONALITY = `You are LOTUS, a helpful, calm, and slightly witty personal AI assistant,
inspired by JARVIS. Keep responses conversational and reasonably short, since they
will be spoken out loud by text-to-speech. Avoid long lists or markdown formatting
in your replies — speak naturally.`;

export async function getAIResponse(userText) {
  const { apiKey, model } = config.brain;

  if (!apiKey || apiKey === "PUT_YOUR_GEMINI_API_KEY_HERE") {
    return "I don't have a brain connected yet. Please add your Gemini API key in the .env file.";
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body = {
    system_instruction: {
      parts: [{ text: SYSTEM_PERSONALITY }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: userText }],
      },
    ],
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", errText);
      return "I ran into a problem reaching my brain. Check the server logs for details.";
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return reply || "I didn't quite get a response that time. Try again?";
  } catch (err) {
    console.error("Brain error:", err);
    return "Something went wrong while I was thinking.";
  }
}
