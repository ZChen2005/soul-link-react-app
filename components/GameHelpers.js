import { findAbilityName, findPokemonByName, speciesName, speciesTypes } from "./PokemonData.js";

export const MAX_TEAM = 6;

export const STATUS = {
  NONE: "",
  CAPTURED: "captured",
  MISSED: "missed",
  DEATH: "death",
};

export const STATUS_OPTIONS = [
  { value: STATUS.NONE, label: "—" },
  { value: STATUS.CAPTURED, label: "Captured" },
  { value: STATUS.MISSED, label: "Missed" },
  { value: STATUS.DEATH, label: "Death" },
];

// A route is one catch area. `pokemon` holds one entry per player (or null).
export function newRoute(name, playerCount) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    status: STATUS.NONE,
    pokemon: Array(playerCount).fill(null),
  };
}

// Pokemon saved by earlier versions (name text, web sprite links...) become
// { dexId, nickname, nature, ability }.
function migratePokemon(pokemon) {
  if (!pokemon || pokemon.dexId !== undefined) return pokemon || null;
  const entry = pokemon.species ? findPokemonByName(pokemon.species) : null;
  const next = {
    dexId: entry ? entry.id : null,
    nickname: pokemon.nickname || "",
    nature: pokemon.nature || "",
    ability: pokemon.ability ? findAbilityName(pokemon.ability) : "",
  };
  return next.dexId == null && !next.nickname && !next.nature && !next.ability ? null : next;
}

// Makes sure a saved game has routes/team and one pokemon slot per player.
export function normalizeGame(game) {
  const n = game.players.length;
  const routes = (game.routes || []).map((route) => {
    const { deathCause, cause: savedCause, ...rest } = route;
    const cause = savedCause !== undefined ? savedCause : deathCause; // older saves used deathCause
    const valid =
      (route.status === STATUS.DEATH || route.status === STATUS.MISSED) &&
      Number.isInteger(cause) &&
      cause >= 0 &&
      cause < n;
    return {
      ...rest,
      // Which player caused the death or the miss (player index); cleared for other statuses.
      ...(valid ? { cause } : {}),
      pokemon: Array.from({ length: n }, (_, i) =>
        migratePokemon(route.pokemon && route.pokemon[i])
      ),
    };
  });
  const team = (game.team || []).filter((id) =>
    routes.some((r) => r.id === id && r.status === STATUS.CAPTURED)
  );
  return { ...game, routes, team };
}

export function countStatus(routes, status) {
  return routes.filter((r) => r.status === status).length;
}

// Nickname if there is one, otherwise the Pokemon's name.
export function displayName(pokemon) {
  return pokemon ? pokemon.nickname || speciesName(pokemon) : "";
}

// "Electric" or "Grass / Poison"
export function typeLabel(pokemon) {
  return speciesTypes(pokemon).join(" / ");
}

// Search matches the route name or any pokemon's name, nickname or type.
export function matchesSearch(route, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [route.name];
  route.pokemon.forEach((p) => {
    if (p) haystack.push(speciesName(p), p.nickname, ...speciesTypes(p));
  });
  return haystack.some((text) => (text || "").toLowerCase().includes(q));
}

// Pokeball size so a whole link of `count` balls fits in `available` px.
export function ballSize(count, max = 60, available = 250) {
  const size = Math.floor(available / (count + (count - 1) * 0.7));
  return Math.max(22, Math.min(max, size));
}