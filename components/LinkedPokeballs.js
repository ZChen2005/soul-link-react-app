import { Fragment } from "react";
import PokemonIcon from "./PokemonIcon.js";
import { displayName } from "./GameHelpers.js";

// A row of pokeballs (one per player) joined by chains = one Soul Link.
// `items` is an array with one pokemon (or null) per player.
export default function LinkedPokeballs({ items, size, variant, onBallClick, names }) {
  return (
    <div className="linked">
      {items.map((pokemon, i) => {
        const ball = <PokemonIcon pokemon={pokemon} variant={variant} size={size} />;
        const label = `${names[i]}: ${pokemon ? displayName(pokemon) || "Pokemon" : "empty"}`;

        return (
          <Fragment key={i}>
            {i > 0 && (
              <span
                className="chain"
                aria-hidden="true"
                style={{ marginTop: Math.max(0, size / 2 - 6) }}
              />
            )}
            {onBallClick ? (
              <button
                type="button"
                className="ball-btn"
                title={label}
                aria-label={label}
                onClick={() => onBallClick(i)}
              >
                {ball}
              </button>
            ) : (
              ball
            )}
          </Fragment>
        );
      })}
    </div>
  );
}