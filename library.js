import { newAdventure, restoreAdventure } from "./adventure.js";

export const GAME_ID = "cloudkeepers-storybook";
export const SCHEMA_VERSION = 1;
export const CONTENT_VERSION = 1;
export const GUEST_STORAGE_KEY = `${GAME_ID}:guest:v1`;
export const PROFILE_IDS = ["explorer-one", "explorer-two"];

function createProfile(nickname, year) {
  return {
    nickname,
    data: { glow: 0, metPip: false, adventure: newAdventure(year) },
  };
}

export function createLibrary() {
  return {
    schemaVersion: SCHEMA_VERSION,
    contentVersion: CONTENT_VERSION,
    selectedProfileId: PROFILE_IDS[0],
    profiles: {
      [PROFILE_IDS[0]]: createProfile("Player 1", 1),
      [PROFILE_IDS[1]]: createProfile("Player 2", 3),
    },
    preferences: { night: false },
  };
}

function safeNickname(value, fallback) {
  const nickname = typeof value === "string" ? value.trim().slice(0, 30) : "";
  return nickname || fallback;
}

function restoreProfile(raw, fallback, year) {
  const data = raw?.data || raw || {};
  return {
    nickname: safeNickname(raw?.nickname, fallback),
    data: {
      glow: [0, 1, 2].includes(data.glow) ? data.glow : 0,
      metPip: data.metPip === true,
      adventure: restoreAdventure(data.adventure, year),
    },
  };
}

export function restoreLibrary(raw) {
  const fresh = createLibrary();
  if (!raw || typeof raw !== "object") return fresh;
  const profiles = {};
  for (const [index, id] of PROFILE_IDS.entries()) {
    profiles[id] = restoreProfile(
      raw.profiles?.[id],
      fresh.profiles[id].nickname,
      index === 0 ? 1 : 3,
    );
  }
  const selectedProfileId = PROFILE_IDS.includes(raw.selectedProfileId)
    ? raw.selectedProfileId
    : PROFILE_IDS[0];
  return {
    schemaVersion: SCHEMA_VERSION,
    contentVersion: CONTENT_VERSION,
    selectedProfileId,
    profiles,
    preferences: { night: raw.preferences?.night === true },
  };
}

export function profileEntries(library) {
  return PROFILE_IDS.map((id) => [id, library.profiles[id]]);
}
