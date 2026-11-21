import PokemonIcon from "./PokemonIcon.js";
import { MAX_TEAM, typeLabel } from "./GameHelpers.js";
import { speciesName } from "./PokemonData.js";

function SkullIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 2C7.6 2 4 5.4 4 9.6c0 2.4 1.1 4.4 2.8 5.7V19a1 1 0 0 0 1 1H9v-2h1.5v2h3v-2H15v2h1.2a1 1 0 0 0 1-1v-3.7c1.7-1.3 2.8-3.3 2.8-5.7C20 5.4 16.4 2 12 2Zm-3.2 11.2a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm6.4 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Captured routes as cards. Each card holds one pokemon per player.
export default function BoxTab({ game, routes, onBallClick, onToggleTeam, onKill }) {
  const count = game.players.length;
  const teamFull = game.team.length >= MAX_TEAM;
  const cardWidth = Math.max(230, count * 88 + 20);

  if (routes.length === 0) {
    return (
      <div className="tab-box">
        <p className="table-empty">
          {game.routes.some((r) => r.status === "captured")
            ? "Nothing matches your search."
            : "No captured Pokemon yet. Set a route's status to Captured."}
        </p>
      </div>
    );
  }

  return (
    <div className="tab-box box-scroll">
      <div
        className="box-grid"
        style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${cardWidth + 56}px, 1fr))` }}
      >
        {routes.map((route) => {
          const inTeam = game.team.includes(route.id);
          return (
            <div className="box-item" key={route.id}>
              <article
                className={`box-card${inTeam ? " in-team" : ""}`}
                style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
                aria-label={route.name}
              >
                {route.pokemon.map((pokemon, i) => (
                  <div className="box-pokemon" key={i}>
                    <div className="box-pokemon-top">
                      <button
                        type="button"
                        className="ball-btn"
                        onClick={() => onBallClick(route.id, i)}
                        aria-label={`${game.players[i]}, ${route.name}: edit Pokemon`}
                      >
                        <PokemonIcon pokemon={pokemon} size={36} />
                      </button>
                      <span className="box-type">{typeLabel(pokemon)}</span>
                    </div>
                    <strong className="box-nickname">
                      {pokemon?.nickname || speciesName(pokemon) || "—"}
                    </strong>
                    <span className="box-species">
                      {pokemon?.nickname ? speciesName(pokemon) : ""}
                    </span>
                  </div>
                ))}
                <span className="box-route">{route.name}</span>
              </article>

              <div className="box-actions">
                <button
                  type="button"
                  className="round-btn"
                  onClick={() => onToggleTeam(route.id)}
                  disabled={!inTeam && teamFull}
                  aria-label={inTeam ? `Remove ${route.name} from team` : `Add ${route.name} to team`}
                  title={inTeam ? "Remove from team" : teamFull ? "Team is full" : "Add to team"}
                >
                  {inTeam ? "−" : "+"}
                </button>
                <button
                  type="button"
                  className="round-btn"
                  onClick={() => onKill(route.id)}
                  aria-label={`Mark ${route.name} as dead`}
                  title="Mark as dead"
                >
                  <SkullIcon />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}