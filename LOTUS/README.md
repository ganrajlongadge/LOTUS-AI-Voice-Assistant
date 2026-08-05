# LOTUS — Phase 1: Simple Talking AI

A browser-based voice assistant. Talk to it, it thinks (via Gemini), it talks back.

## Folder structure

```
LOTUS/
├── frontend/       → what you open in the browser
│   ├── index.html
│   ├── style.css
│   └── app.js
├── backend/        → local server, keeps your API key safe
│   ├── server.js
│   ├── brain.js
│   ├── config.js
│   ├── .env.example
│   └── package.json
└── README.md
```

## Setup (one-time)

1. **Get a free Gemini API key**
   Go to https://aistudio.google.com → sign in → create an API key (no credit card needed).

2. **Install backend dependencies**
   Open a terminal in the `LOTUS/backend` folder and run:
   ```bash
   npm install
   ```

3. **Add your API key**
   In `LOTUS/backend`, copy `.env.example` and rename the copy to `.env`.
   Open `.env` and paste your key:
   ```
   GEMINI_API_KEY=your_real_key_here
   PORT=3000
   ```

## Running LOTUS

1. **Start the backend** (from `LOTUS/backend`):
   ```bash
   npm start
   ```
   You should see: `LOTUS backend running at http://localhost:3000`
   Leave this terminal window open.

2. **Open the frontend**
   Go to the `LOTUS/frontend` folder and double-click `index.html`
   (or right-click → Open With → your browser).
   **Use Google Chrome** — it has the best support for the voice features.

3. **Talk to it**
   Tap the mic button, speak, and LOTUS will reply out loud.

## Troubleshooting

- "Couldn't reach the backend" → make sure `npm start` is still running in the terminal.
- Mic button does nothing → make sure you're using Chrome, and allow microphone permission when prompted.
- LOTUS says it has no brain connected → double check your `.env` file has the real API key, not the placeholder text.

## What's next (future upgrades)

This project is structured so each piece can be swapped or upgraded independently:
- `brain.js` → can later support offline models (Ollama) alongside Gemini
- STT/TTS in `app.js` → can later be swapped for offline options (Whisper, Piper)
- A `tools/` layer can be added later so LOTUS can actually perform tasks, not just chat
