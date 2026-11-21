import PokemonIcon from "./PokemonIcon.js";
import { displayName } from "./GameHelpers.js";

// One tombstone per dead route. Every linked pokemon is on the same stone.
export default function GraveTab({ game, routes }) {
  const count = game.players.length;

  if (routes.length === 0) {
    return (
      <div className="tab-box">
        <p className="table-empty">
          {game.routes.some((r) => r.status === "death")
            ? "Nothing matches your search."
            : "No deaths yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="tab-box box-scroll">
      <div className="grave-grid">
        {routes.map((route) => (
          <figure className="tomb" key={route.id} title={route.name}>
            <div
              className="tomb-body"
              style={{ gridTemplateColumns: `repeat(${count}, auto)` }}
            >
              {route.pokemon.map((pokemon, i) => (
                <PokemonIcon key={i} pokemon={pokemon} size={count > 4 ? 36 : 52} />
              ))}
            </div>
            <figcaption
              className="tomb-base"
              style={{ gridTemplateColumns: `repeat(${count}, auto)` }}
            >
              {route.pokemon.map((pokemon, i) => (
                <span key={i} className={route.cause === i ? "tomb-cause" : undefined}>
                  {displayName(pokemon) || "—"}
                </span>
              ))}
            </figcaption>
            {route.cause != null && (
              <p className="tomb-killer">Caused by {game.players[route.cause]}</p>
            )}
          </figure>
        ))}
      </div>
    </div>
  );
}