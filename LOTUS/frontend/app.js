// app.js
// Phase 1: browser-native STT and TTS.
// LATER: these two responsibilities move into swappable modules
// (offline Whisper / Piper) — the rest of the app won't need to change,
// since it only ever calls listen()/speak()-equivalent hooks below.

const BACKEND_URL = "http://localhost:3000/chat";

const micBtn = document.getElementById("micBtn");
const dockLabel = document.getElementById("dockLabel");
const core = document.getElementById("core");
const coreStatus = document.getElementById("coreStatus");
const hint = document.getElementById("hint");
const chatLog = document.getElementById("chatLog");
const logEmpty = document.getElementById("logEmpty");
const logCount = document.getElementById("logCount");
const clockEl = document.getElementById("clock");
const connIndicator = document.getElementById("connIndicator");
const connLabel = document.getElementById("connLabel");

let entryCount = 0;

// ---------- clock ----------
function tickClock() {
  const now = new Date();
  clockEl.textContent = now.toLocaleTimeString("en-GB", { hour12: false });
}
tickClock();
setInterval(tickClock, 1000);

// ---------- connectivity indicator ----------
function updateConnIndicator() {
  const online = navigator.onLine;
  connIndicator.classList.toggle("offline", !online);
  connLabel.textContent = online ? "ONLINE" : "OFFLINE";
}
updateConnIndicator();
window.addEventListener("online", updateConnIndicator);
window.addEventListener("offline", updateConnIndicator);

// ---------- core state machine ----------
// states: idle, listening, thinking, speaking, error
function setState(state, statusText, hintText) {
  core.dataset.state = state;
  coreStatus.textContent = statusText;
  if (hintText !== undefined) hint.textContent = hintText;
}

// ---------- Speech-to-Text setup ----------
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
    micBtn.classList.add("active");
    dockLabel.textContent = "LISTENING";
    setState("listening", "LISTENING", "Speak now...");
  };

  recognition.onend = () => {
    isListening = false;
    micBtn.classList.remove("active");
    dockLabel.textContent = "TAP TO SPEAK";
  };

  recognition.onerror = (event) => {
    setState("error", "MIC ERROR", `Microphone error: ${event.error}`);
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    handleUserSpeech(transcript);
  };
} else {
  hint.textContent = "Speech recognition isn't supported in this browser. Try Chrome.";
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

// ---------- full pipeline: STT result -> backend -> TTS ----------
async function handleUserSpeech(text) {
  addToLog("user", text);
  setState("thinking", "PROCESSING", "Thinking...");
  dockLabel.textContent = "PROCESSING";

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) throw new Error(`Server responded ${response.status}`);

    const data = await response.json();
    const reply = data.reply || "No response received.";

    addToLog("ai", reply);
    speak(reply);
  } catch (err) {
    console.error(err);
    addToLog("system", "Connection lost — check that the local server is running.");
    setState("error", "OFFLINE", "Couldn't reach the backend. Is server.js running?");
    dockLabel.textContent = "TAP TO SPEAK";
  }
}

// ---------- Text-to-Speech ----------
function speak(text) {
  if (!window.speechSynthesis) {
    setState("error", "TTS ERROR", "Speech synthesis isn't supported in this browser.");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;

  utterance.onstart = () => {
    dockLabel.textContent = "RESPONDING";
    setState("speaking", "RESPONDING", "Speaking...");
  };

  utterance.onend = () => {
    dockLabel.textContent = "TAP TO SPEAK";
    setState("idle", "STANDBY", "Tap the control below to speak");
  };

  window.speechSynthesis.speak(utterance);
}

// ---------- transcript log UI ----------
function addToLog(role, text) {
  if (logEmpty) logEmpty.remove();

  const entry = document.createElement("div");
  entry.className = `entry ${role}`;

  const meta = document.createElement("div");
  meta.className = "entry-meta";
  const label = role === "user" ? "YOU" : role === "ai" ? "LOTUS" : "SYSTEM";
  const time = new Date().toLocaleTimeString("en-GB", { hour12: false });
  meta.textContent = `${label} · ${time}`;

  const body = document.createElement("div");
  body.className = "entry-text";
  body.textContent = text;

  entry.appendChild(meta);
  entry.appendChild(body);
  chatLog.appendChild(entry);
  chatLog.scrollTop = chatLog.scrollHeight;

  entryCount += 1;
  logCount.textContent = `${entryCount} ${entryCount === 1 ? "entry" : "entries"}`;
}
