// config.js
// Central place to control settings. Later, when we add more providers
// (local Ollama, Groq, etc.), this is the ONLY file we touch to switch.

export const config = {
  brain: {
    provider: "gemini",       // future: "ollama", "groq", etc.
    model: "gemini-3.6-flash",
    apiKey: process.env.GEMINI_API_KEY || "PUT_YOUR_GEMINI_API_KEY_HERE",
  },
  server: {
    port: process.env.PORT || 3000,
  },
};
