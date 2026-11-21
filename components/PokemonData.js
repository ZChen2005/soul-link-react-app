// Everything about Pokemon, natures and abilities comes from the JSON files in src/data.
import pokedex from "../data/pokedex.json";
import abilities from "../data/abilities.json";
import natures from "../data/natures.json";

// "Mr. Mime" / "mr mime" / "MR-MIME" all become "mrmime"; accents are ignored.
export function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/♀/g, "f")
    .replace(/♂/g, "m")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

const byId = new Map(pokedex.map((p) => [p.id, p]));
const byName = new Map(pokedex.map((p) => [normalize(p.name.english), p]));

// Names for the autocomplete list.
export const POKEMON_NAMES = pokedex.map((p) => p.name.english);

export function findPokemonByName(text) {
  return byName.get(normalize(text)) || null;
}

const infoCache = new Map();

// { id, name, types, stats: {hp, atk, def, spa, spd, spe}, evolutions: [{ id, name, how }] }
export function getInfo(id) {
  if (infoCache.has(id)) return infoCache.get(id);
  const entry = byId.get(id);
  if (!entry) return null;

  const evolutions = ((entry.evolution && entry.evolution.next) || [])
    .map(([nextId, how]) => ({ id: Number(nextId), how }))
    .filter((e) => byId.has(e.id))
    .map((e) => ({ ...e, name: byId.get(e.id).name.english }));

  const info = {
    id: entry.id,
    name: entry.name.english,
    types: entry.type,
    stats: {
      hp: entry.base.HP,
      atk: entry.base.Attack,
      def: entry.base.Defense,
      spa: entry.base["Sp. Attack"],
      spd: entry.base["Sp. Defense"],
      spe: entry.base.Speed,
    },
    evolutions,
  };
  infoCache.set(id, info);
  return info;
}

// A saved Pokemon looks like { dexId, nickname, nature, ability }.
export function speciesName(pokemon) {
  const info = pokemon && pokemon.dexId != null ? getInfo(pokemon.dexId) : null;
  return info ? info.name : "";
}

export function speciesTypes(pokemon) {
  const info = pokemon && pokemon.dexId != null ? getInfo(pokemon.dexId) : null;
  return info ? info.types : [];
}

// Natures: the stat that goes up and the one that goes down come from the multipliers.
const STAT_KEYS = ["hp", "atk", "def", "spa", "spd", "spe"];

export const NATURES = natures
  .map((n) => ({
    name: n.name,
    up: STAT_KEYS.find((key) => n[key] > 1),
    down: STAT_KEYS.find((key) => n[key] < 1),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

// { up, down } for a nature name (both undefined for neutral natures).
export function natureEffect(name) {
  const nature = NATURES.find((n) => n.name === name);
  return nature ? { up: nature.up, down: nature.down } : {};
}

// Abilities: any ability can be given to any Pokemon.
export const ABILITIES = abilities.slice().sort((a, b) => a.name.localeCompare(b.name));

export function abilityDescription(name) {
  const ability = abilities.find((a) => a.name === name);
  return ability ? ability.description : "";
}

export function findAbilityName(text) {
  const wanted = normalize(text);
  const ability = abilities.find((a) => normalize(a.name) === wanted);
  return ability ? ability.name : "";
}

export function findNatureName(text) {
  const wanted = normalize(text);
  const nature = NATURES.find((n) => normalize(n.name) === wanted);
  return nature ? nature.name : "";
}
