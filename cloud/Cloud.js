import { initializeApp } from "firebase/app";
import { deleteDoc, doc, getFirestore, onSnapshot, setDoc } from "firebase/firestore";
import { firebaseConfig } from "./FirebaseConfig.js";

// Shared storage for games (Firebase Firestore). One document per game, kept at
// games/<game id>. Anyone who has the game's link can read and change it.
let db = null;
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    db = getFirestore(initializeApp(firebaseConfig));
  } catch (error) {
    console.error("[cloud] Could not start Firebase. Check src/cloud/FirebaseConfig.js.", error);
  }
}

export const cloudEnabled = db !== null;

// Firestore rejects `undefined`, so send a plain JSON copy.
const plain = (game) => JSON.parse(JSON.stringify(game));

export function cloudSaveNow(game) {
  if (!db) return Promise.resolve();
  return setDoc(doc(db, "games", game.id), plain(game)).catch((error) =>
    console.error("[cloud] Could not save the game.", error)
  );
}

// Typing sends a change per keystroke, so saves wait until things go quiet for a moment.
const pending = new Map(); // game id -> { timer, game }
const SAVE_DELAY = 500;

export function cloudSaveSoon(game) {
  if (!db) return;
  const waiting = pending.get(game.id);
  if (waiting) clearTimeout(waiting.timer);
  const timer = setTimeout(() => {
    pending.delete(game.id);
    cloudSaveNow(game);
  }, SAVE_DELAY);
  pending.set(game.id, { timer, game });
}

export const hasPendingCloudSave = (id) => pending.has(id);

// Removes the game from the database for everyone. Resolves true when it worked.
export async function cloudDelete(id) {
  const waiting = pending.get(id);
  if (waiting) clearTimeout(waiting.timer); // don't let a queued save bring it back
  pending.delete(id);
  if (!db) return true;
  try {
    await deleteDoc(doc(db, "games", id));
    return true;
  } catch (error) {
    console.error("[cloud] Could not delete the game.", error);
    return false;
  }
}

function flushCloudSaves() {
  pending.forEach(({ timer, game }) => {
    clearTimeout(timer);
    cloudSaveNow(game);
  });
  pending.clear();
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", flushCloudSaves);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushCloudSaves();
  });
}

// Calls onGame with the game's data (or null if it does not exist) now and on every
// change made by someone else. Returns a function that stops listening.
export function cloudListen(id, onGame, onError) {
  if (!db) return () => {};
  return onSnapshot(
    doc(db, "games", id),
    (snapshot) => {
      if (snapshot.metadata.hasPendingWrites) return; // our own change, already on screen
      if (!snapshot.exists() && snapshot.metadata.fromCache) return; // wait for the server
      onGame(snapshot.exists() ? snapshot.data() : null);
    },
    (error) => {
      console.error("[cloud] Could not load the game.", error);
      if (onError) onError(error);
    }
  );
}