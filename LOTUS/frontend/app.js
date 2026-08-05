// app.js
// Phase 1: uses the browser's built-in STT and TTS.
// LATER: these two jobs will move into their own swappable modules
// (offline Whisper / Piper options) — but the rest of this app won't
// need to change when that happens, since it just calls a "listen()"
// and "speak()" function either way.

const BACKEND_URL = "http://localhost:3000/chat";

const micBtn = document.getElementById("micBtn");
const orb = document.getElementById("orb");
const statusEl = document.getElementById("status");
const chatLog = document.getElementById("chatLog");

// ---- Speech-to-Text setup ----
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isListening = false;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    isListening = true;
    orb.classList.add("listening");
    micBtn.classList.add("active");
    statusEl.textContent = "Listening...";
  };

  recognition.onend = () => {
    isListening = false;
    orb.classList.remove("listening");
    micBtn.classList.remove("active");
  };

  recognition.onerror = (event) => {
    statusEl.textContent = `Mic error: ${event.error}`;
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    handleUserSpeech(transcript);
  };
} else {
  statusEl.textContent = "Speech recognition not supported in this browser. Try Chrome.";
  micBtn.disabled = true;
}

micBtn.addEventListener("click", () => {
  if (!recognition) return;
  if (isListening) {
    recognition.stop();
  } else {
    recognition.start();
  }
});

// ---- Handle full pipeline: STT result -> backend -> TTS ----
async function handleUserSpeech(text) {
  addToLog("user", text);
  statusEl.textContent = "Thinking...";

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();
    const reply = data.reply || "I didn't get a response.";

    addToLog("ai", reply);
    speak(reply);
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Couldn't reach the backend. Is server.js running?";
  }
}

// ---- Text-to-Speech ----
function speak(text) {
  if (!window.speechSynthesis) {
    statusEl.textContent = "Speech synthesis not supported in this browser.";
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;

  utterance.onstart = () => {
    orb.classList.add("speaking");
    statusEl.textContent = "Speaking...";
  };

  utterance.onend = () => {
    orb.classList.remove("speaking");
    statusEl.textContent = "Tap the mic to talk";
  };

  window.speechSynthesis.speak(utterance);
}

// ---- Chat log UI ----
function addToLog(role, text) {
  const entry = document.createElement("div");
  entry.className = `entry ${role}`;

  const label = document.createElement("span");
  label.className = "label";
  label.textContent = role === "user" ? "YOU" : "LOTUS";

  const body = document.createElement("div");
  body.textContent = text;

  entry.appendChild(label);
  entry.appendChild(body);
  chatLog.appendChild(entry);
  chatLog.scrollTop = chatLog.scrollHeight;
}
