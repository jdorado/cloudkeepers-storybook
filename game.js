import { createJourneyUI } from "./journey-ui.js";
import {
  createLibrary,
  GUEST_STORAGE_KEY,
  profileEntries,
  restoreLibrary,
} from "./library.js";
import { setupCloud } from "./cloud-save.js";
const $ = (selector) => document.querySelector(selector);
const game = $("#game");
const artboard = $("#artboard");
const explorer = $("#explorer");
const fox = $("#fox");
const modal = $("#modal");
const content = $("#modal-content");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const glows = [
  { name: "Golden sunlight", color: "#e7bd67" },
  { name: "Leaf green", color: "#89b890" },
  { name: "Peach blossom", color: "#dfa09b" },
];
const readGuest = () => {
  try {
    return restoreLibrary(JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY)));
  } catch {
    return createLibrary();
  }
};
let preferences = readGuest();
let activeCloud = null;
let journey;
const save = () => {
  if (activeCloud?.userId) activeCloud.save(preferences);
  else {
    try {
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(preferences));
    } catch {}
  }
};
const selectedProfile = () => preferences.profiles[preferences.selectedProfileId];
const currentPlayer = () => selectedProfile().data;
const playerName = () => selectedProfile().nickname;
const icon = (name, className = "icon") =>
  `<svg class="${className}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
let position = { x: 52, y: 57 };
let destination = null;
let lastFrame = 0;
let lastFocus = null;
let toastTimer;
let soundEnabled = false;
let audioContext;
let soundTimer;
let travelBusy = false;
const heldKeys = new Set();

function fitWorld() {
  const width = game.clientWidth;
  const height = game.clientHeight;
  const ratio = 1586 / 992;
  const portrait = width / height < 0.95;
  const boardWidth = portrait
    ? Math.max(width * 1.7, 650)
    : Math.max(width, height * ratio);
  const boardHeight = boardWidth / ratio;
  artboard.style.width = `${boardWidth}px`;
  artboard.style.height = `${boardHeight}px`;
  artboard.style.setProperty("--scale", boardWidth / 1586);
  artboard.style.top = portrait ? `${height * 0.49}px` : "50%";
  // Keep every interactive marker on screen on smaller devices.
  fox.style.setProperty("--x", portrait ? "64" : "63");
  $(".ferry").style.setProperty("--x", portrait ? "72" : "86");
  $(".cottage").style.setProperty("--x", portrait ? "69" : "71");
  $(".signpost").style.setProperty("--x", portrait ? "32" : "24");
}
new ResizeObserver(fitWorld).observe(game);

function updatePlayer() {
  $("#player-label").textContent = playerName();
  explorer.setAttribute(
    "aria-label",
    `Meet ${playerName()}'s Cloudkeeper`,
  );
  game.style.setProperty("--magic-color", glows[currentPlayer().glow].color);
  journey.update();
}

function updateNight() {
  game.classList.toggle("night", preferences.preferences.night);
  $("#day-toggle").setAttribute(
    "aria-pressed",
    String(preferences.preferences.night),
  );
  $("#day-toggle").setAttribute(
    "aria-label",
    preferences.preferences.night ? "Change to sunshine" : "Change to moonlight",
  );
  $("#day-toggle").innerHTML = icon(
    preferences.preferences.night ? "moon" : "sun",
  );
  $("#weather-label").textContent = preferences.preferences.night
    ? "A little magic in the moonlight"
    : "A lovely day to explore";
}

function toast(message) {
  clearTimeout(toastTimer);
  $("#toast").textContent = message;
  $("#toast").classList.add("show");
  toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 3300);
}

function tone(frequency, at = 0, duration = 0.35, volume = 0.035) {
  if (!soundEnabled || !audioContext) return;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const now = audioContext.currentTime + at;
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.035);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
}
function chime() {
  tone(523.25, 0, 0.45);
  tone(659.25, 0.09, 0.45);
  tone(783.99, 0.18, 0.6);
}
function ambience() {
  if (document.hidden || !soundEnabled) return;
  const notes = [261.63, 329.63, 392, 523.25, 587.33];
  tone(notes[Math.floor(Math.random() * notes.length)], 0, 2, 0.012);
  tone(130.81, 0.1, 2.5, 0.008);
}

function openPanel(panel) {
  destination = null;
  heldKeys.clear();
  if (!modal.open) lastFocus = document.activeElement;
  if (journey.handles(panel)) journey.render(panel);
  else if (panel === "explorer") renderExplorer();
  if (!modal.open) modal.showModal();
  $("#close-modal").focus();
}
function closePanel() {
  modal.close();
}
modal.addEventListener("close", () => {
  heldKeys.clear();
  lastFocus?.focus({ preventScroll: true });
});
$("#close-modal").addEventListener("click", closePanel);
modal.addEventListener("click", (event) => {
  if (event.target !== modal) return;
  const bounds = modal.getBoundingClientRect();
  if (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  )
    closePanel();
});

function heading(kicker, title, description = "") {
  return `<div class="modal-intro"><div class="eyebrow">${kicker}</div><h2 id="modal-title">${title}</h2>${description ? `<p>${description}</p>` : ""}</div>`;
}
function renderExplorer() {
  content.innerHTML = `${heading("SMALL EXPLORER · BIG HEART", `${playerName()}’s Cloudkeeper`, "A golden scarf, a star compass, and a pocket full of possibility.")}
    <div class="explorer-layout"><div class="explorer-preview" style="--magic-color:${glows[currentPlayer().glow].color}"><img src="assets/explorer.webp" alt="Your little explorer with a leafy cap, golden scarf, green overalls, backpack, and star compass"></div>
    <div class="explorer-custom"><h3>Choose your magic glow</h3><div class="color-swatches">${glows.map((glow, i) => `<button class="color-swatch ${currentPlayer().glow === i ? "selected" : ""}" data-glow="${i}" style="--swatch:${glow.color}" aria-label="${glow.name}" aria-pressed="${currentPlayer().glow === i}">${currentPlayer().glow === i ? icon("check") : ""}</button>`).join("")}</div>
    <div class="explorer-detail">${icon("compass")}<div><strong>A little star compass</strong><span>For finding the next adventure.</span></div></div><div class="explorer-detail">${icon("heart")}<div><strong>A kind and curious heart</strong><span>The most special thing you carry.</span></div></div><p>This is our first explorer idea. You get to help decide who your Cloudkeeper becomes.</p></div></div>`;
}
document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (journey.click(button)) return;
  if (button.dataset.open) {
    tone(440, 0, 0.16, 0.02);
    openPanel(button.dataset.open);
  } else if (button.dataset.dialog) {
    chime();
    openPanel(button.dataset.dialog);
  } else if (button === explorer) openPanel("explorer");
  else if (button.dataset.player) {
    preferences.selectedProfileId = button.dataset.player;
    resetPosition();
    updatePlayer();
    save();
    closePanel();
    toast(`Welcome to the clouds, ${playerName()}!`);
    chime();
  } else if (button.dataset.glow !== undefined) {
    currentPlayer().glow = Number(button.dataset.glow);
    save();
    updatePlayer();
    renderExplorer();
    content.querySelector(`[data-glow="${currentPlayer().glow}"]`).focus();
    tone(659, 0, 0.35);
  }
});

function petPip() {
  fox.classList.remove("wiggle");
  void fox.offsetWidth;
  fox.classList.add("wiggle");
  const bounds = fox.getBoundingClientRect();
  const gameBounds = game.getBoundingClientRect();
  for (let i = 0; i < 7; i++) {
    const heart = document.createElement("span");
    heart.className = "heart-particle";
    heart.textContent = i % 2 ? "♥" : "✦";
    heart.style.left = `${bounds.left + bounds.width * 0.5 - gameBounds.left + (Math.random() - 0.5) * 35}px`;
    heart.style.top = `${bounds.top + bounds.height * 0.35 - gameBounds.top}px`;
    heart.style.setProperty("--drift", `${(Math.random() - 0.5) * 100}px`);
    heart.style.animationDelay = `${i * 0.09}s`;
    $("#hearts").append(heart);
    setTimeout(() => heart.remove(), 2500);
  }
}
function constrain(point) {
  // Elliptical clearing, slightly inset from the island's edge.
  const center = { x: 53, y: 52.5 };
  const radius = { x: 20.5, y: 9.0 };
  const dx = (point.x - center.x) / radius.x;
  const dy = (point.y - center.y) / radius.y;
  const length = Math.hypot(dx, dy);
  return length > 1
    ? {
        x: center.x + (dx / length) * radius.x,
        y: center.y + (dy / length) * radius.y,
      }
    : point;
}
$("#walk-area").addEventListener("pointerdown", (event) => {
  if (modal.open || travelBusy || event.button > 0) return;
  const bounds = artboard.getBoundingClientRect();
  destination = constrain({
    x: ((event.clientX - bounds.left) / bounds.width) * 100,
    y: ((event.clientY - bounds.top) / bounds.height) * 100,
  });
  $("#destination").style.left = `${destination.x}%`;
  $("#destination").style.top = `${destination.y}%`;
  $("#destination").classList.remove("visible");
  void $("#destination").offsetWidth;
  $("#destination").classList.add("visible");
});
const movementKeys = [
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "w",
  "a",
  "s",
  "d",
];
window.addEventListener("keydown", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (
    modal.open ||
    travelBusy ||
    !movementKeys.includes(key) ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey
  )
    return;
  event.preventDefault();
  heldKeys.add(key);
  destination = null;
  // A short tap should still take a step, even between animation frames.
  if (!event.repeat) {
    const dx =
      Number(key === "ArrowRight" || key === "d") -
      Number(key === "ArrowLeft" || key === "a");
    const dy =
      Number(key === "ArrowDown" || key === "s") -
      Number(key === "ArrowUp" || key === "w");
    moveExplorer(dx, dy, 0.055);
  }
});
window.addEventListener("keyup", (event) =>
  heldKeys.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key),
);
window.addEventListener("blur", () => {
  heldKeys.clear();
  destination = null;
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    heldKeys.clear();
    destination = null;
  }
});

function moveExplorer(vx, vy, dt) {
  const length = Math.hypot(vx, vy);
  vx /= length;
  vy /= length;
  position = constrain({
    x: position.x + vx * dt * 9,
    y: position.y + (vy * dt * 9) / 0.626,
  });
  explorer.style.setProperty("--x", position.x);
  explorer.style.setProperty("--y", position.y);
  if (Math.abs(vx) > 0.08) explorer.classList.toggle("facing-left", vx < 0);
  explorer.style.zIndex = position.y > 55 ? "5" : "3";
}

function frame(time) {
  const dt = Math.min((time - lastFrame) / 1000 || 0, 0.045);
  lastFrame = time;
  let vx = 0,
    vy = 0;
  if (!modal.open && !travelBusy) {
    vx =
      Number(heldKeys.has("ArrowRight") || heldKeys.has("d")) -
      Number(heldKeys.has("ArrowLeft") || heldKeys.has("a"));
    vy =
      Number(heldKeys.has("ArrowDown") || heldKeys.has("s")) -
      Number(heldKeys.has("ArrowUp") || heldKeys.has("w"));
    if (destination) {
      const dx = destination.x - position.x;
      const dy = (destination.y - position.y) * 0.626;
      const distance = Math.hypot(dx, dy);
      if (distance < 0.25) destination = null;
      else {
        vx = dx / distance;
        vy = dy / distance;
      }
    }
  }
  const walking = vx !== 0 || vy !== 0;
  explorer.classList.toggle("walking", walking && !reducedMotion);
  if (walking) moveExplorer(vx, vy, dt);
  requestAnimationFrame(frame);
}

$("#day-toggle").addEventListener("click", () => {
  preferences.preferences.night = !preferences.preferences.night;
  save();
  updateNight();
  tone(preferences.preferences.night ? 329.63 : 523.25, 0, 0.7);
});
$("#sound-toggle").addEventListener("click", async () => {
  try {
    if (!audioContext)
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    await audioContext.resume();
    soundEnabled = !soundEnabled;
    $("#sound-toggle").setAttribute("aria-pressed", String(soundEnabled));
    $("#sound-toggle").setAttribute(
      "aria-label",
      soundEnabled ? "Turn off gentle sounds" : "Turn on gentle sounds",
    );
    $("#sound-toggle").innerHTML = icon(soundEnabled ? "sound" : "muted");
    if (soundEnabled) {
      chime();
      ambience();
      soundTimer = setInterval(ambience, 4500);
      toast("Soft sounds are on.");
    } else {
      clearInterval(soundTimer);
      toast("A quiet moment in the clouds.");
    }
  } catch {
    toast("Gentle sounds are not available in this browser.");
  }
});
$("#fullscreen").addEventListener("click", async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await game.requestFullscreen();
  } catch {
    toast("You can also use your browser’s full screen button.");
  }
});
document.addEventListener("fullscreenchange", () => {
  $("#fullscreen").setAttribute(
    "aria-label",
    document.fullscreenElement ? "Leave full screen" : "Full screen",
  );
});

for (let i = 0; i < 22; i++) {
  const firefly = document.createElement("span");
  firefly.className = "firefly";
  firefly.style.left = `${25 + Math.random() * 58}%`;
  firefly.style.top = `${35 + Math.random() * 25}%`;
  firefly.style.animationDelay = `${-Math.random() * 5}s`;
  firefly.style.animationDuration = `${3 + Math.random() * 3}s`;
  $("#fireflies").append(firefly);
}
function resetPosition() {
  position = { x: 52, y: 57 };
  destination = null;
  heldKeys.clear();
  explorer.style.setProperty("--x", 52);
  explorer.style.setProperty("--y", 57);
}
journey = createJourneyUI({
  game,
  content,
  modal,
  icon,
  save,
  toast,
  chime,
  closePanel,
  openPanel,
  currentPlayer,
  playerName,
  evidenceProfiles: () => Object.entries(preferences.profiles).map(([profileId, profile]) => ({ profileId, nickname: profile.nickname, evidence: profile.data.adventure.evidence, pending: profile.data.adventure.session })),
  currentProfileId: () => preferences.selectedProfileId,
  profileEntries: () => profileEntries(preferences),
  player: (id) => preferences.profiles[id].data,
  renamePlayer: (id, nickname) => {
    preferences.profiles[id].nickname = nickname;
    save();
    updatePlayer();
  },
  celebrate: petPip,
  resetPosition,
  setTravelling: (value) => {
    travelBusy = value;
    destination = null;
    heldKeys.clear();
  },
});
updatePlayer();
updateNight();
fitWorld();
requestAnimationFrame(frame);

const setSaveStatus = (message, error = false) => {
  const status = $("#save-status");
  status.textContent = message;
  status.classList.toggle("save-error", error);
  $(".preview-label").textContent = message.toUpperCase();
};
const applyLibrary = (library) => {
  preferences = restoreLibrary(library);
  resetPosition();
  updateNight();
  updatePlayer();
};
setupCloud({
  apply: applyLibrary,
  guest: readGuest,
  status: setSaveStatus,
  activate: (cloud) => {
    activeCloud = cloud;
  },
});
