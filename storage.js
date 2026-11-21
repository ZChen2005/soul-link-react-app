import { cloudDelete, cloudSaveNow, cloudSaveSoon } from "./cloud/Cloud.js";

// Games you have opened are remembered in this browser (localStorage) so they show up in
// Load Game. When sharing is set up (src/firebaseConfig.js) they are also stored online.
const KEY = "soulLinkGames";

export function getGames() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveGames(games) {
  try {
    localStorage.setItem(KEY, JSON.stringify(games));
  } catch {
    // storage unavailable; ignore
  }
}

export function getGame(id) {
  return getGames().find((g) => g.id === id) || null;
}

// A long random id, so a game's link can't be guessed.
export function newGameId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Array.from({ length: 4 }, () => Math.random().toString(36).slice(2, 10)).join("");
}

// Add or replace the copy kept in this browser (does not touch the online copy).
export function rememberGame(game) {
  const games = getGames();
  const index = games.findIndex((g) => g.id === game.id);
  if (index < 0) games.push(game);
  else games[index] = game;
  saveGames(games);
}

// Ids of games known to exist online. If one of these later disappears from the database,
// someone deleted it, and it must not be uploaded again.
const SYNCED_KEY = "soulLinkSynced";

function syncedIds() {
  try {
    return JSON.parse(localStorage.getItem(SYNCED_KEY)) || [];
  } catch {
    return [];
  }
}

export const isSynced = (id) => syncedIds().includes(id);

export function markSynced(id) {
  try {
    const ids = syncedIds();
    if (!ids.includes(id)) localStorage.setItem(SYNCED_KEY, JSON.stringify([...ids, id]));
  } catch {
    // storage unavailable; ignore
  }
}

export function addGame(game) {
  rememberGame(game);
  markSynced(game.id);
  cloudSaveNow(game);
}

// Save a change made on this computer (here and online).
export function saveGame(game) {
  rememberGame(game);
  cloudSaveSoon(game);
}

// Removes the game from this browser's list only (used when someone else deleted it).
export function forgetGame(id) {
  // The id stays in the synced list on purpose: if another tab still has this game open,
  // it must see that the online copy is gone instead of uploading it again.
  saveGames(getGames().filter((g) => g.id !== id));
}

// Deletes the game here and from the online database, so nobody can open it any more.
// Resolves false if the online copy could not be deleted.
export async function deleteGame(id) {
  forgetGame(id);
  return cloudDelete(id);
}