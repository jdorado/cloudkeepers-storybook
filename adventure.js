import { generateQuestion, normaliseAnswer, TOPICS } from "./questions.js";
export { TOPICS };
export const TRAVEL_STARS = 3,
  RESCUE_STARS = 5;
const CLEAN_ANSWERS_TO_LEVEL = 2;
export const ISLANDS = [
  [
    "Clover Cove",
    "🌳",
    "#a3be7b",
    "Pip",
    "fox",
    "🦊",
    "Rope bridge",
    "bridge",
    "clover-cove.webp",
    "A little fox has lost the path home. Light the bridge and help Pip find his courage.",
  ],
  [
    "Sunflower Isle",
    "🌻",
    "#d2c779",
    "Poppy",
    "rabbit",
    "🐰",
    "Sky zeppelin",
    "zeppelin",
    "sunflower.webp",
    "Poppy is hiding among giant sunflowers. Gather cloud stars to lift the sky zeppelin.",
  ],
  [
    "Coral Cloud",
    "🐚",
    "#d2ab92",
    "Shelly",
    "turtle",
    "🐢",
    "Cloud sailboat",
    "boat",
    "coral.webp",
    "Shelly dreams of seeing the sky. Mend a cloud sailboat beside the coral lagoon.",
  ],
  [
    "Moonbeam Meadow",
    "🌙",
    "#b5afce",
    "Luna",
    "owl",
    "🦉",
    "Hot-air balloon",
    "balloon",
    "moonbeam.webp",
    "Luna guards a glowing garden. Wake the balloon with a little mathematical magic.",
  ],
  [
    "Bamboo Breeze",
    "🎋",
    "#a9c3b4",
    "Bao",
    "panda",
    "🐼",
    "Leaf glider",
    "glider",
    "clover-cove.webp",
    "Bao is waiting in the bamboo. Make a leaf glider big enough for the whole crew.",
  ],
  [
    "Peachwood Grove",
    "🌸",
    "#dfb1a5",
    "Kiki",
    "koala",
    "🐨",
    "Giant kite",
    "kite",
    "sunflower.webp",
    "Kiki needs a gentle ride. Share the cloud berries and send a giant kite into the breeze.",
  ],
  [
    "Frostfall Peak",
    "❄️",
    "#a7c9d5",
    "Pebble",
    "penguin",
    "🐧",
    "Cloud sled",
    "sled",
    "frost.webp",
    "Pebble is a long way from home. Follow the icy waterfall and prepare a cloud sled.",
  ],
  [
    "Amber Market",
    "🪙",
    "#dab986",
    "Hugo",
    "hedgehog",
    "🦔",
    "Propeller plane",
    "plane",
    "sunflower.webp",
    "Hugo runs a tiny sky market. Count coins and ready the little propeller plane.",
  ],
  [
    "Crystal Springs",
    "💎",
    "#aad6d6",
    "Finn",
    "frog",
    "🐸",
    "Dragonfly wings",
    "wings",
    "coral.webp",
    "Finn needs a home with a pond. Measure the supplies for your dragonfly-wing journey.",
  ],
  [
    "Starlight Garden",
    "⭐",
    "#b6a9d0",
    "Mochi",
    "cat",
    "🐱",
    "Moon rocket",
    "rocket",
    "moonbeam.webp",
    "Mochi follows the stars. Read the sky clocks and prepare a gentle moon rocket.",
  ],
  [
    "Rainbow Ridge",
    "🌈",
    "#c8cba2",
    "Fern",
    "deer",
    "🦌",
    "Rainbow bridge",
    "rainbow",
    "frost.webp",
    "Fern is stranded on the ridge. Build a rainbow path across the clouds.",
  ],
  [
    "Cloudkeeper Haven",
    "🏡",
    "#d3c595",
    "Sunny",
    "puppy",
    "🐶",
    "Home beacon",
    "beacon",
    "clover-cove.webp",
    "Sunny is your last waiting friend. Light the home beacon and bring all twelve animals home.",
  ],
].map(
  (
    [
      name,
      glyph,
      color,
      friend,
      animal,
      animalGlyph,
      travel,
      vehicle,
      background,
      description,
    ],
    i,
  ) => ({
    name,
    glyph,
    color,
    friend,
    animal,
    animalGlyph,
    travel,
    vehicle,
    background,
    description,
    topic: i,
    x: [14, 38, 65, 86, 62, 36, 13, 39, 65, 87, 59, 25][i],
    y: [82, 79, 83, 68, 57, 58, 45, 35, 34, 24, 13, 13][i],
  }),
);

export function newAdventure(year = 1) {
  return {
    version: 1,
    year,
    currency: "GBP",
    current: 0,
    islands: ISLANDS.map((_, i) => ({
      unlocked: i === 0,
      stars: 0,
      rescued: false,
      travel: false,
    })),
    skills: { 1: {}, 3: {} },
    session: null,
    history: [],
    correct: 0,
    incorrect: 0,
    won: false,
  };
}
export function restoreAdventure(saved, defaultYear = 1) {
  const state = newAdventure(defaultYear);
  if (!saved || saved.version !== 1) return state;
  state.year = [1, 3].includes(saved.year) ? saved.year : defaultYear;
  state.currency = saved.currency === "AED" ? "AED" : "GBP";
  state.correct = Math.max(0, Number(saved.correct) || 0);
  state.incorrect = Math.max(0, Number(saved.incorrect) || 0);
  for (let i = 0; i < 12; i++) {
    const record = saved.islands?.[i];
    if (!record) continue;
    const previous = i === 0 || state.islands[i - 1].travel;
    const stars = Math.max(
      0,
      Math.min(5, Math.floor(Number(record.stars) || 0)),
    );
    state.islands[i] = {
      unlocked: previous && record.unlocked === true,
      stars,
      rescued: stars >= 5 && record.rescued === true,
      travel: stars >= 3 && record.travel === true,
    };
    if (!state.islands[i].unlocked)
      state.islands[i] = {
        unlocked: false,
        stars: 0,
        rescued: false,
        travel: false,
      };
  }
  state.islands[0].unlocked = true;
  state.current =
    Number.isInteger(saved.current) && state.islands[saved.current]?.unlocked
      ? saved.current
      : 0;
  for (const year of [1, 3])
    for (let topic = 0; topic < 12; topic++) {
      const s = saved.skills?.[year]?.[topic];
      if (s)
        state.skills[year][topic] = {
          level: Math.max(0, Math.min(2, Math.floor(s.level) || 0)),
          streak: Math.max(0, Math.min(2, s.streak || 0)),
          misses: Math.max(0, Math.min(1, s.misses || 0)),
          correct: Math.max(0, s.correct || 0),
          incorrect: Math.max(0, s.incorrect || 0),
        };
    }
  state.history = Array.isArray(saved.history)
    ? saved.history.filter((x) => typeof x === "string").slice(-24)
    : [];
  const session = saved.session,
    q = session?.question;
  if (
    q &&
    q.island === state.current &&
    q.year === state.year &&
    typeof q.id === "string" &&
    typeof q.prompt === "string" &&
    typeof q.answer === "string" &&
    Array.isArray(q.options) &&
    q.options.some(
      (o) => normaliseAnswer(o.value) === normaliseAnswer(q.answer),
    )
  )
    state.session = {
      question: q,
      attempts: Math.max(0, Number(session.attempts) || 0),
      hint: session.hint === true,
      solved: session.solved === true,
    };
  state.won = canWin(state);
  return state;
}
export function canWin(state) {
  return (
    state.current === 11 &&
    state.islands.every((x) => x.rescued) &&
    state.islands[11].travel
  );
}
export function rescuedCount(state) {
  return state.islands.filter((x) => x.rescued).length;
}
export function journeyObjective(state) {
  const record = state.islands[state.current];
  if (canWin(state)) return "victory";
  if (record.stars < RESCUE_STARS) return "earn-star";
  if (!record.rescued) return "rescue";
  if (
    rescuedCount(state) === state.islands.length &&
    state.current !== state.islands.length - 1
  )
    return "return-haven";
  if (!record.travel)
    return state.current === state.islands.length - 1
      ? "light-beacon"
      : "unlock-travel";
  if (state.current < state.islands.length - 1) return "travel-forward";
  return "find-missing";
}
export function skill(state, topic) {
  return (state.skills[state.year][topic] ||= {
    level: 0,
    streak: 0,
    misses: 0,
    correct: 0,
    incorrect: 0,
  });
}
export function nextQuestion(state, random = Math.random) {
  if (
    state.session &&
    !state.session.solved &&
    state.session.question.island === state.current
  )
    return state.session.question;
  // The final island revisits earlier topics as well as interpreting charts.
  const topic =
    state.current === 11 && state.islands[11].stars % 2 === 1
      ? Math.floor(random() * 11)
      : state.current;
  let q;
  for (let attempts = 0; attempts < 30; attempts++) {
    q = generateQuestion(
      topic,
      state.year,
      skill(state, topic).level,
      random,
      state.currency,
    );
    if (!state.history.includes(q.signature)) break;
  }
  q.id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${random()}`;
  q.island = state.current;
  state.history.push(q.signature);
  state.history = state.history.slice(-24);
  state.session = { question: q, attempts: 0, hint: false, solved: false };
  return q;
}
export function submitAnswer(state, id, value) {
  const session = state.session,
    q = session?.question;
  if (
    !q ||
    q.id !== id ||
    session.solved ||
    q.island !== state.current ||
    q.year !== state.year
  )
    return { ignored: true };
  const s = skill(state, q.topic);
  const correct = normaliseAnswer(value) === normaliseAnswer(q.answer);
  if (!correct) {
    session.attempts++;
    state.incorrect++;
    s.incorrect++;
    s.streak = 0;
    s.misses++;
    if (s.misses >= 2) {
      s.level = Math.max(0, s.level - 1);
      s.misses = 0;
    }
    return {
      correct: false,
      explanation: session.attempts >= 2 ? q.explanation : q.hint,
    };
  }
  session.solved = true;
  state.correct++;
  s.correct++;
  s.misses = 0;
  if (!session.hint && session.attempts === 0) {
    s.streak++;
    if (s.streak >= CLEAN_ANSWERS_TO_LEVEL) {
      s.level = Math.min(2, s.level + 1);
      s.streak = 0;
    }
  } else s.streak = 0;
  const island = state.islands[state.current];
  island.stars = Math.min(5, island.stars + 1);
  return {
    correct: true,
    stars: island.stars,
    travelReady: island.stars >= 3 && !island.travel,
    rescueReady: island.stars >= 5 && !island.rescued,
  };
}
export function unlockTravel(state) {
  const island = state.islands[state.current];
  if (island.stars < 3) return false;
  island.travel = true;
  if (state.current < 11) state.islands[state.current + 1].unlocked = true;
  state.won = canWin(state);
  return true;
}
export function rescueAnimal(state) {
  const island = state.islands[state.current];
  if (island.stars < 5 || island.rescued) return false;
  island.rescued = true;
  state.won = canWin(state);
  return true;
}
export function visitIsland(state, index) {
  if (!Number.isInteger(index) || !state.islands[index]?.unlocked) return false;
  state.current = index;
  state.session = null;
  state.won = canWin(state);
  return true;
}
export function changeYear(state, year) {
  if (![1, 3].includes(year)) return false;
  state.year = year;
  state.session = null;
  return true;
}
