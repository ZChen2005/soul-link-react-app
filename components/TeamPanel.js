import { Fragment } from "react";
import LinkedPokeballs from "./LinkedPokeballs.js";
import { MAX_TEAM, ballSize } from "./GameHelpers.js";

// Six slots, each one a chain of pokeballs (one per player).
export default function TeamPanel({ game, onBallClick }) {
  const count = game.players.length;
  const size = ballSize(count);

  return (
    <aside className="team-panel" aria-label="Team">
      <h2 className="team-title">Team</h2>
      <hr className="team-rule" />
      {/* Player names above their columns; same layout as a row of linked pokeballs. */}
      <div className="team-names" aria-hidden="true">
        {game.players.map((name, i) => (
          <Fragment key={i}>
            {i > 0 && <span className="team-names-gap" />}
            <span className="team-name" style={{ width: size }} title={name}>
              <span>{name}</span>
            </span>
          </Fragment>
        ))}
      </div>
      <div className="team-slots">
        {Array.from({ length: MAX_TEAM }, (_, slot) => {
          const route = game.routes.find((r) => r.id === game.team[slot]);
          const items = route ? route.pokemon : Array(count).fill(null);

          return (
            <div className="team-slot" key={slot}>
              <LinkedPokeballs
                items={items}
                size={size}
                names={game.players}
                variant={route ? "bright" : "muted"}
                onBallClick={route ? (i) => onBallClick(route.id, i) : undefined}
              />
            </div>
          );
        })}
      </div>
    </aside>
  );
}