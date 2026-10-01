const $ = (selector) => document.querySelector(selector);
const game = $("#game");
const artboard = $("#artboard");
const explorer = $("#explorer");
const fox = $("#fox");
const modal = $("#modal");
const content = $("#modal-content");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const storageKey = "cloudkeepers.world.v1";
const playerNames = ["Daniela", "Sofia"];
const glows = [
  { name: "Golden sunlight", color: "#e7bd67" },
  { name: "Leaf green", color: "#89b890" },
  { name: "Peach blossom", color: "#dfa09b" },
];
let preferences = {
  player: "Daniela",
  players: {
    Daniela: { glow: 0, metPip: false },
    Sofia: { glow: 0, metPip: false },
  },
  night: false,
};
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (saved && playerNames.includes(saved.player)) {
    preferences.player = saved.player;
    preferences.night = saved.night === true;
    for (const name of playerNames) {
      preferences.players[name].glow = [0, 1, 2].includes(
        saved.players?.[name]?.glow,
      )
        ? saved.players[name].glow
        : 0;
      preferences.players[name].metPip = saved.players?.[name]?.metPip === true;
    }
  }
} catch {
  /* The world also works with browser storage disabled. */
}
const save = () => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(preferences));
  } catch {}
};
const currentPlayer = () => preferences.players[preferences.player];
const icon = (name, className = "icon") =>
  `<svg class="${className}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
let position = { x: 52, y: 57 };
let destination = null;
let lastFrame = 0;
let activePanel = null;
let lastFocus = null;
let toastTimer;
let selectedIsland = 0;
let soundEnabled = false;
let audioContext;
let soundTimer;
let travelBusy = false;
const heldKeys = new Set();

const islands = [
  {
    name: "Clover Cove",
    glyph: "🌳",
    color: "#a3be7b",
    animal: "Pip the fox",
    travel: "Sky ferry",
    description:
      "A little cottage, a grassy clearing, and your first curious friend. This is where our adventure begins.",
    x: 14,
    y: 82,
  },
  {
    name: "Sunflower Isle",
    glyph: "🌻",
    color: "#d2c779",
    animal: "A new friend",
    travel: "A new way to fly",
    description:
      "What if the next island grew flowers taller than our explorer? This is one idea for us to imagine together.",
    x: 38,
    y: 79,
  },
  {
    name: "Coral Cloud",
    glyph: "🐚",
    color: "#d2ab92",
    animal: "A new friend",
    travel: "A new way to fly",
    description:
      "A tiny sea in the sky, with shells, ripples, and a very unusual shore. What animal could live here?",
    x: 65,
    y: 83,
  },
  {
    name: "Moonbeam Meadow",
    glyph: "🌙",
    color: "#b5afce",
    animal: "A new friend",
    travel: "A new way to fly",
    description:
      "Perhaps an island of glowing flowers and gentle moonlight. Who might need our help here?",
    x: 86,
    y: 68,
  },
  {
    name: "Island 05",
    glyph: "❔",
    color: "#a9c3b4",
    animal: "Your idea here",
    travel: "Your idea here",
    description:
      "An empty page in our sky story. Sofia and Daniela get to help imagine this island.",
    x: 62,
    y: 57,
  },
  {
    name: "Island 06",
    glyph: "❔",
    color: "#b6c6a1",
    animal: "Your idea here",
    travel: "Your idea here",
    description:
      "An empty page in our sky story. What would make this island magical?",
    x: 36,
    y: 58,
  },
  {
    name: "Island 07",
    glyph: "❔",
    color: "#bdcbaa",
    animal: "Your idea here",
    travel: "Your idea here",
    description:
      "An empty page in our sky story. Could our explorer travel here by bridge, balloon, or something wonderful?",
    x: 13,
    y: 45,
  },
  {
    name: "Island 08",
    glyph: "❔",
    color: "#b2c4b5",
    animal: "Your idea here",
    travel: "Your idea here",
    description:
      "An empty page in our sky story. Which animal would you love to find?",
    x: 39,
    y: 35,
  },
  {
    name: "Island 09",
    glyph: "❔",
    color: "#bfc6ae",
    animal: "Your idea here",
    travel: "Your idea here",
    description:
      "An empty page in our sky story. What colours would you give this island?",
    x: 65,
    y: 34,
  },
  {
    name: "Island 10",
    glyph: "❔",
    color: "#aec3b9",
    animal: "Your idea here",
    travel: "Your idea here",
    description:
      "An empty page in our sky story. Where should our explorer go next?",
    x: 87,
    y: 24,
  },
  {
    name: "Island 11",
    glyph: "❔",
    color: "#b8c4a7",
    animal: "Your idea here",
    travel: "Your idea here",
    description:
      "One last little island before home. What amazing way could we travel there?",
    x: 59,
    y: 13,
  },
  {
    name: "Cloudkeeper Haven",
    glyph: "🏡",
    color: "#d3c595",
    animal: "All 12 friends",
    travel: "Together at last",
    description:
      "Our future home above the clouds. One day, we will bring all twelve rescued animal friends here together.",
    x: 25,
    y: 13,
  },
];
const friends = [
  { name: "Pip", animal: "Little fox", glyph: "🦊" },
  { name: "Friend 02", animal: "Who will it be?", glyph: "🐰" },
  { name: "Friend 03", animal: "Who will it be?", glyph: "🐢" },
  { name: "Friend 04", animal: "Who will it be?", glyph: "🦉" },
  { name: "Friend 05", animal: "Who will it be?", glyph: "🐼" },
  { name: "Friend 06", animal: "Who will it be?", glyph: "🐨" },
  { name: "Friend 07", animal: "Who will it be?", glyph: "🐧" },
  { name: "Friend 08", animal: "Who will it be?", glyph: "🦔" },
  { name: "Friend 09", animal: "Who will it be?", glyph: "🐸" },
  { name: "Friend 10", animal: "Who will it be?", glyph: "🐱" },
  { name: "Friend 11", animal: "Who will it be?", glyph: "🦌" },
  { name: "Friend 12", animal: "Who will it be?", glyph: "🐶" },
];

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
  $("#profile-name").innerHTML =
    `${preferences.player}<small>Little Cloudkeeper</small>`;
  $("#player-label").textContent = preferences.player;
  explorer.setAttribute(
    "aria-label",
    `Meet ${preferences.player}'s Cloudkeeper`,
  );
  game.style.setProperty("--magic-color", glows[currentPlayer().glow].color);
  if (currentPlayer().metPip) {
    $("#invitation .eyebrow").textContent = "A LITTLE FRIEND, A BIG HELLO";
    $("#invitation h2").textContent = "Pip is happy to see you";
    $("#invitation p").textContent = "There’s always time for a fox cuddle.";
    $("#invitation .primary-button").innerHTML = `Say hello ${icon("heart")}`;
  } else {
    $("#invitation .eyebrow").textContent = "SOMEONE WANTS TO MEET YOU";
    $("#invitation h2").textContent = "A friend in the ferns";
    $("#invitation p").textContent = "That little fox looks curious…";
    $("#invitation .primary-button").innerHTML = `Meet Pip ${icon("arrow")}`;
  }
}

function updateNight() {
  game.classList.toggle("night", preferences.night);
  $("#day-toggle").setAttribute("aria-pressed", String(preferences.night));
  $("#day-toggle").setAttribute(
    "aria-label",
    preferences.night ? "Change to sunshine" : "Change to moonlight",
  );
  $("#day-toggle").innerHTML = icon(preferences.night ? "moon" : "sun");
  $("#weather-label").textContent = preferences.night
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
  activePanel = panel;
  if (!modal.open) lastFocus = document.activeElement;
  if (panel === "map") renderMap();
  else if (panel === "friends") renderFriends();
  else if (panel === "profile") renderProfiles();
  else if (panel === "explorer") renderExplorer();
  else if (panel === "help") renderHelp();
  else renderDialogue(panel);
  if (!modal.open) modal.showModal();
  $("#close-modal").focus();
}
function closePanel() {
  modal.close();
}
modal.addEventListener("close", () => {
  activePanel = null;
  heldKeys.clear();
  lastFocus?.focus();
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
function renderMap() {
  const path = islands
    .map((island, i) => `${i ? "L" : "M"} ${island.x} ${island.y}`)
    .join(" ");
  content.innerHTML = `${heading("TWELVE LITTLE WORLDS · ONE BIG ADVENTURE", "Our sky, waiting to be discovered", "A first sketch of the journey. Pick an island to peek at its story.")}
    <div class="map-layout"><div class="map-canvas" aria-label="Concept map of twelve floating islands"><svg class="map-route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="${path}" vector-effect="non-scaling-stroke"/></svg><div class="map-cloud"></div><div class="map-cloud"></div>
    ${islands.map((island, i) => `<button class="map-island ${i === selectedIsland ? "selected" : ""}" data-island="${i}" aria-label="Preview island ${i + 1}, ${island.name}" aria-pressed="${i === selectedIsland}" style="--mx:${island.x};--my:${island.y};--island-color:${island.color}"><span class="island-number">${String(i + 1).padStart(2, "0")}</span><span class="island-mini" aria-hidden="true">${island.glyph}</span><span class="island-name">${island.name}</span></button>`).join("")}</div><div class="map-detail" id="map-detail" aria-live="polite"></div></div>
    <div class="modal-note">${icon("leaf")} Most islands are still waiting for your ideas. We get to design this world together.</div>`;
  renderMapDetail();
}
function renderMapDetail() {
  const island = islands[selectedIsland];
  $("#map-detail").innerHTML =
    `<div class="detail-art" style="--island-color:${island.color}"><span class="island-mini" aria-hidden="true">${island.glyph}</span></div><div class="eyebrow">ISLAND ${String(selectedIsland + 1).padStart(2, "0")} ${selectedIsland === 0 ? "· YOU ARE HERE" : "· A FUTURE CHAPTER"}</div><h3>${island.name}</h3><p>${island.description}</p><div class="detail-tags"><span>${icon("paw")} ${island.animal}</span></div><button class="primary-button" ${selectedIsland === 0 ? 'data-action="return"' : 'data-action="imagine"'}>${selectedIsland === 0 ? "Explore Clover Cove" : "Imagine this island"} ${icon("arrow")}</button>`;
}
function renderFriends() {
  content.innerHTML = `${heading("THE CLOUDKEEPER’S FIELD JOURNAL", "A sky full of friends", "Twelve places in your crew. A whole world of animals to imagine.")}
  <div class="friends-grid">${friends.map((friend, i) => `<button class="friend-card ${i === 0 && currentPlayer().metPip ? "met" : ""}" ${i === 0 ? 'data-dialog="pip"' : `data-friend="${i}"`} aria-label="${i === 0 ? "Meet Pip the fox" : "Imagine animal friend " + (i + 1)}"><span class="friend-art" aria-hidden="true">${i === 0 ? '<img src="assets/pip.webp" alt="">' : friend.glyph}</span><h3>${friend.name}</h3><p>${friend.animal}</p><span class="friend-status">${i === 0 ? (currentPlayer().metPip ? "SAID HELLO · NOT RESCUED YET" : "WAITING IN CLOVER COVE") : "AN ANIMAL IDEA"}</span></button>`).join("")}</div>
  <div class="modal-note">${icon("heart")} Saying hello is just the beginning. Our future mission: rescue all twelve and bring them home together.</div>`;
}
function renderProfiles() {
  content.innerHTML = `${heading("EVERY CLOUDKEEPER HAS A STORY", "Who’s exploring today?", "Your little discoveries and favourite glow stay with your explorer on this browser.")}
    <div class="profile-grid">${playerNames.map((name) => `<button class="player-option ${preferences.player === name ? "selected" : ""}" data-player="${name}" aria-pressed="${preferences.player === name}">${preferences.player === name ? `<span class="chosen-check">${icon("check")}</span>` : ""}<img src="assets/explorer.webp" alt="Cloudkeeper explorer"><h3>${name}</h3><p>${name === "Daniela" ? "Little steps, big adventures" : "Curious mind, brave heart"}</p></button>`).join("")}</div>
    <div class="modal-note">${icon("star")} The same wonderful sky, with room for both of you.</div>`;
}
function renderExplorer() {
  content.innerHTML = `${heading("SMALL EXPLORER · BIG HEART", `${preferences.player}’s Cloudkeeper`, "A golden scarf, a star compass, and a pocket full of possibility.")}
    <div class="explorer-layout"><div class="explorer-preview" style="--magic-color:${glows[currentPlayer().glow].color}"><img src="assets/explorer.webp" alt="Your little explorer with a leafy cap, golden scarf, green overalls, backpack, and star compass"></div>
    <div class="explorer-custom"><h3>Choose your magic glow</h3><div class="color-swatches">${glows.map((glow, i) => `<button class="color-swatch ${currentPlayer().glow === i ? "selected" : ""}" data-glow="${i}" style="--swatch:${glow.color}" aria-label="${glow.name}" aria-pressed="${currentPlayer().glow === i}">${currentPlayer().glow === i ? icon("check") : ""}</button>`).join("")}</div>
    <div class="explorer-detail">${icon("compass")}<div><strong>A little star compass</strong><span>For finding the next adventure.</span></div></div><div class="explorer-detail">${icon("heart")}<div><strong>A kind and curious heart</strong><span>The most special thing you carry.</span></div></div><p>This is our first explorer idea. You get to help decide who your Cloudkeeper becomes.</p></div></div>`;
}
function renderHelp() {
  content.innerHTML = `${heading("A LITTLE HELP FOR YOUR ADVENTURE", "Make yourself at home", "There’s no hurry up here in the clouds.")}
    <div class="help-grid"><div class="help-card">${icon("compass")}<h3>Take a little wander</h3><p>Use the arrow keys or W, A, S, D. On a touchscreen, tap the grassy clearing to move.</p></div><div class="help-card">${icon("paw")}<h3>Say hello</h3><p>Tap Pip the fox to meet your first friend. Tap the cottage, signpost, and sky ferry to discover their stories.</p></div><div class="help-card">${icon("map")}<h3>Dream of the journey</h3><p>Open the Sky map to see twelve islands. Most are waiting for your ideas. Our last island is a home for all twelve animals.</p></div><div class="help-card">${icon("sun")}<h3>Find your favourite feeling</h3><p>Try sunshine or moonlight. Turn on soft sounds, choose your explorer, and pick a magic glow.</p></div></div>
    <p class="help-footer">This is the first chapter: exploring our world. Maths challenges and earning animal rescues will be part of our next chapters.</p>`;
}
function renderDialogue(type) {
  const dialogues = {
    pip: {
      kicker: "YOUR FIRST HELLO · CLOVER COVE",
      title: currentPlayer().metPip ? "Pip remembers you!" : "Oh, hello there!",
      image: "assets/pip.webp",
      alt: "Pip the little fox",
      text: `A rustle in the ferns… two little ears… and a very fluffy tail.<br><br>“I’m Pip! Are you a Cloudkeeper? I’ve always wanted to see what’s beyond these clouds.”`,
      button: currentPlayer().metPip ? "Give Pip a cuddle" : "Say hello to Pip",
      action: "pet",
    },
    cottage: {
      kicker: "A COSY CORNER OF THE SKY",
      title: "A little home for big dreams",
      glyph: "🏡",
      text: "The little cottage smells like warm toast. There’s a soft blanket by the round window, and a shelf just waiting for your adventure stories.<br><br>Every explorer needs somewhere cosy to begin.",
      button: "Back to the sunshine",
      action: "return",
    },
    sign: {
      kicker: "A NOTE FROM AN OLD CLOUDKEEPER",
      title: "Follow your curiosity",
      glyph: "🧭",
      text: "“To the clouds, and whatever comes next.”<br><br>The sign points toward twelve islands. One day, your adventures will help animals join your crew and unlock wonderful ways to travel.<br><br>Your journey ends when all twelve friends reach their new home together.",
      button: "Show me the sky map",
      action: "map",
    },
    ferry: {
      kicker: "A WONDERFUL WAY TO WANDER",
      title: "Meet the little sky ferry",
      glyph: "🎈",
      text: "This tiny zeppelin bobs gently by the dock. There’s room for you, your backpack, and a growing crew of animal friends.<br><br>Want to see it take a little practice flight over Clover Cove?",
      button: "Try a little flight",
      action: "fly",
    },
  };
  const item = dialogues[type] || dialogues.pip;
  content.innerHTML = `<div class="dialogue-layout"><div class="dialogue-portrait">${item.image ? `<img src="${item.image}" alt="${item.alt}">` : `<span class="big-glyph" aria-hidden="true">${item.glyph}</span>`}</div><div><div class="eyebrow">${item.kicker}</div><h2 id="modal-title">${item.title}</h2><p>${item.text}</p><div class="dialogue-buttons"><button class="primary-button" data-action="${item.action}">${item.button} ${icon(item.action === "pet" ? "heart" : "arrow")}</button>${type === "pip" ? '<button class="secondary-button" data-action="return">Keep exploring</button>' : ""}</div></div></div>`;
}

document.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.open) {
    tone(440, 0, 0.16, 0.02);
    openPanel(button.dataset.open);
  } else if (button.dataset.dialog) {
    chime();
    openPanel(button.dataset.dialog);
  } else if (button === explorer) openPanel("explorer");
  else if (button.dataset.island !== undefined) {
    selectedIsland = Number(button.dataset.island);
    document.querySelectorAll("[data-island]").forEach((node) => {
      const selected = Number(node.dataset.island) === selectedIsland;
      node.classList.toggle("selected", selected);
      node.setAttribute("aria-pressed", String(selected));
    });
    renderMapDetail();
    tone(523, 0, 0.2, 0.02);
  } else if (button.dataset.player) {
    preferences.player = button.dataset.player;
    updatePlayer();
    save();
    closePanel();
    toast(`Welcome to the clouds, ${preferences.player}!`);
    chime();
  } else if (button.dataset.glow !== undefined) {
    currentPlayer().glow = Number(button.dataset.glow);
    save();
    updatePlayer();
    renderExplorer();
    content.querySelector(`[data-glow="${currentPlayer().glow}"]`).focus();
    tone(659, 0, 0.35);
  } else if (button.dataset.friend !== undefined) {
    const friend = friends[Number(button.dataset.friend)];
    content.innerHTML = `<div class="dialogue-layout"><div class="dialogue-portrait"><span class="big-glyph" aria-hidden="true">${friend.glyph}</span></div><div><div class="eyebrow">A PLACE IN OUR FUTURE CREW</div><h2 id="modal-title">Who will this friend be?</h2><p>This animal is an idea for our adventure journal.<br><br>What would you name them? Which island would they live on? You get to help tell their story.</p><button class="primary-button" data-action="friends">Back to the journal ${icon("book")}</button></div></div>`;
    activePanel = "friend-idea";
    $("#close-modal").focus();
  } else if (button.dataset.action) {
    const action = button.dataset.action;
    if (action === "return") closePanel();
    else if (action === "map" || action === "friends") openPanel(action);
    else if (action === "pet") {
      closePanel();
      petPip();
    } else if (action === "fly") {
      closePanel();
      fly();
    } else if (action === "imagine") {
      const island = islands[selectedIsland];
      content.innerHTML = `<div class="dialogue-layout"><div class="dialogue-portrait"><span class="big-glyph" aria-hidden="true">${island.glyph}</span></div><div><div class="eyebrow">AN ISLAND FOR US TO IMAGINE</div><h2 id="modal-title">${island.name}</h2><p>${island.description}<br><br>This chapter is still waiting for its story. We’ll choose the scenery, animal, and way to travel together.</p><button class="primary-button" data-action="map">Back to our sky ${icon("map")}</button></div></div>`;
      activePanel = "island-idea";
      $("#close-modal").focus();
    }
  }
});

function petPip() {
  currentPlayer().metPip = true;
  save();
  updatePlayer();
  chime();
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
  toast("Pip’s tail says it all. A new friendship begins!");
}
function fly() {
  if (travelBusy) return;
  travelBusy = true;
  destination = null;
  heldKeys.clear();
  const ferry = $("#ferry");
  ferry.classList.add("flying");
  $("#travel-clouds").classList.add("fly");
  chime();
  toast("A little practice flight above Clover Cove!");
  setTimeout(
    () => {
      ferry.classList.remove("flying");
      $("#travel-clouds").classList.remove("fly");
      travelBusy = false;
      toast("Back home, with your scarf full of sky.");
    },
    reducedMotion ? 250 : 3000,
  );
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
  preferences.night = !preferences.night;
  save();
  updateNight();
  tone(preferences.night ? 329.63 : 523.25, 0, 0.7);
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
updatePlayer();
updateNight();
fitWorld();
requestAnimationFrame(frame);
