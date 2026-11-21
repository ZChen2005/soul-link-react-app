import { useState } from "react";
import Pokeball from "./Pokeball.js";
import SuggestInput from "./SuggestInput.js";
import { typeStyle } from "../data/TypeColors.js";
import {
  ABILITIES,
  NATURES,
  POKEMON_NAMES,
  abilityDescription,
  findAbilityName,
  findNatureName,
  findPokemonByName,
  getInfo,
  natureEffect,
} from "./PokemonData.js";
import { highResSprite, pixelSprite } from "../data/Sprites.js";
import { displayName } from "./GameHelpers.js";

const STATS = [
  ["hp", "HP"],
  ["atk", "ATK"],
  ["def", "DEF"],
  ["spa", "SPA"],
  ["spd", "SPD"],
  ["spe", "SPE"],
];
const MAX_STAT = 255;
const NATURE_NAMES = NATURES.map((n) => n.name);
const ABILITY_NAMES = ABILITIES.map((a) => a.name);

function Arrow({ direction }) {
  const up = direction === "up";
  return (
    <svg
      width="20"
      height="22"
      viewBox="0 0 24 24"
      role="img"
      aria-label={up ? "Raised by nature" : "Lowered by nature"}
    >
      <path
        d={up ? "M12 2 3 12h6v10h6V12h6Z" : "M12 22 3 12h6V2h6v10h6Z"}
        fill="currentColor"
      />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="8" r="4" fill="#d9e0e7" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7Z" fill="#d9e0e7" />
    </svg>
  );
}

// Pop-up for one player's Pokemon on one route. Every change is saved straight away.
export default function PokemonDialog({
  route,
  playerIndex,
  players,
  inTeam,
  teamFull,
  onChange,
  onSelectPlayer,
  onToggleTeam,
  onGrave,
  onClose,
}) {
  const pokemon = route.pokemon[playerIndex] || {};
  const info = pokemon.dexId != null ? getInfo(pokemon.dexId) : null;

  const [speciesText, setSpeciesText] = useState(info ? info.name : "");
  const [error, setError] = useState("");
  const [evolveOptions, setEvolveOptions] = useState(null);

  function commit(patch) {
    const next = { dexId: null, nickname: "", nature: "", ability: "", ...pokemon, ...patch };
    const empty = next.dexId == null && !next.nickname && !next.nature && !next.ability;
    onChange(empty ? null : next);
  }

  function handleSpeciesChange(e) {
    const value = e.target.value;
    setSpeciesText(value);
    setError("");
    setEvolveOptions(null);
    // Typing (or picking) a full name selects that Pokemon right away.
    const match = findPokemonByName(value);
    if (match && match.id !== pokemon.dexId) commit({ dexId: match.id });
  }

  function handleSpeciesBlur() {
    const text = speciesText.trim();
    if (!text) {
      if (pokemon.dexId != null) commit({ dexId: null });
      return;
    }
    const match = findPokemonByName(text);
    if (!match) {
      setError(`No Pokemon named "${text}". Pick one from the list.`);
      return;
    }
    if (match.id !== pokemon.dexId) commit({ dexId: match.id });
    setSpeciesText(match.name.english);
  }

  function evolveTo(id) {
    commit({ dexId: id });
    setSpeciesText(getInfo(id).name);
    setEvolveOptions(null);
    setError("");
  }

  function evolve() {
    setError("");
    const next = info ? info.evolutions : [];
    if (next.length === 0) setError("This Pokemon has no further evolutions.");
    else if (next.length === 1) evolveTo(next[0].id);
    else setEvolveOptions(next);
  }

  const effect = natureEffect(pokemon.nature);
  const art = info ? highResSprite(info.id) : "";
  const others = players.map((name, i) => ({ name, i })).filter((p) => p.i !== playerIndex);
  const needsCapture = route.status !== "captured";
  const teamTitle = inTeam
    ? ""
    : needsCapture
    ? "Set this route's status to Captured first"
    : teamFull
    ? "Team is full"
    : "";

  return (
    <div
      className="overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div
        className="pdialog"
        role="dialog"
        aria-modal="true"
        aria-label={`${players[playerIndex]}, ${route.name}`}
      >
        <div className="pd-top">
          <input
            className="pd-input"
            type="text"
            list="pokemon-names"
            placeholder="Pokemon"
            aria-label="Pokemon name"
            autoFocus
            autoComplete="off"
            value={speciesText}
            onChange={handleSpeciesChange}
            onBlur={handleSpeciesBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSpeciesBlur();
              }
            }}
          />
          <datalist id="pokemon-names">
            {POKEMON_NAMES.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          <input
            className="pd-input"
            type="text"
            placeholder="Nickname"
            aria-label="Nickname"
            value={pokemon.nickname || ""}
            onChange={(e) => commit({ nickname: e.target.value })}
          />
          <button type="button" className="pd-close" onClick={onClose} aria-label="Close">
            X
          </button>
        </div>
        <p className="pd-caption">
          {players[playerIndex]} &middot; {route.name}
        </p>
        {error && (
          <p className="pd-error" role="alert">
            {error}
          </p>
        )}

        <div className="pd-body">
          <div className="pd-left">
            <div className="pd-art">
              {art ? <img src={art} alt={info.name} /> : <Pokeball size={140} />}
            </div>

            <div className="pd-type-row">
              {(info ? info.types : []).map((t) => (
                <span className="type-badge" key={t} style={typeStyle(t)}>
                  {t}
                </span>
              ))}
              <SuggestInput
                className="pd-select"
                listId="nature-names"
                ariaLabel="Nature"
                placeholder="Nature"
                value={pokemon.nature || ""}
                options={NATURE_NAMES}
                find={findNatureName}
                onCommit={(nature) => commit({ nature })}
              />
            </div>

            <div className="pd-stats">
              {STATS.map(([key, label]) => {
                const value = info ? info.stats[key] : undefined;
                const pct = value ? Math.min(100, (value / MAX_STAT) * 100) : 0;
                return (
                  <div className="pd-stat" key={key}>
                    <span className="pd-stat-arrow">
                      {effect.up === key && <Arrow direction="up" />}
                      {effect.down === key && <Arrow direction="down" />}
                    </span>
                    <span className="pd-stat-label">{label}</span>
                    <div
                      className="pd-bar"
                      role="img"
                      aria-label={`${label} ${value === undefined ? "unknown" : value}`}
                    >
                      <div className="pd-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="pd-value">{value === undefined ? "###" : value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pd-right">
            <h3 className="pd-linked-title">Linked:</h3>
            <div className="pd-linked">
              {others.map(({ name, i }) => {
                const other = route.pokemon[i];
                const sprite = other && other.dexId != null ? pixelSprite(other.dexId) : "";
                const label = `${name}: ${other ? displayName(other) || "Pokemon" : "empty"}`;
                return (
                  <button
                    type="button"
                    key={i}
                    className="pd-linked-btn"
                    title={label}
                    aria-label={`Switch to ${label}`}
                    onClick={() => onSelectPlayer(i)}
                  >
                    <span className="pd-avatar">
                      {sprite ? (
                        <img
                          src={sprite}
                          alt=""
                          width="54"
                          height="54"
                          style={{ imageRendering: "pixelated" }}
                        />
                      ) : (
                        <PersonIcon />
                      )}
                    </span>
                    <span className="pd-linked-name">{name}</span>
                  </button>
                );
              })}
            </div>

            <div className="pd-actions">
              <button
                type="button"
                className="pd-btn"
                onClick={onToggleTeam}
                disabled={!inTeam && (needsCapture || teamFull)}
                title={teamTitle}
              >
                {inTeam ? "Remove from Team" : "Add to Team"}
              </button>
              <button type="button" className="pd-btn" onClick={evolve} disabled={!info}>
                Evolve
              </button>
              {evolveOptions && (
                <div className="pd-evolve-options" role="group" aria-label="Evolve into">
                  {evolveOptions.map((option) => (
                    <button
                      type="button"
                      className="pd-btn small"
                      key={option.id}
                      onClick={() => evolveTo(option.id)}
                    >
                      <span>{option.name}</span>
                      <small>{option.how}</small>
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                className="pd-btn"
                onClick={onGrave}
                disabled={route.status === "death"}
              >
                Grave
              </button>
            </div>

            <SuggestInput
              className="pd-select pd-ability"
              listId="ability-names"
              ariaLabel="Ability"
              placeholder="Ability"
              value={pokemon.ability || ""}
              options={ABILITY_NAMES}
              find={findAbilityName}
              onCommit={(ability) => commit({ ability })}
            />
            <p className="pd-ability-text">{abilityDescription(pokemon.ability)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
