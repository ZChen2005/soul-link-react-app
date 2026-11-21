import { STATUS } from "./GameHelpers.js";

// Player names with how many deaths (D) and misses (M) each one caused.
export default function GameHeader({ game }) {
  const caused = (status, player) =>
    game.routes.filter((r) => r.status === status && r.cause === player).length;

  return (
    <header className="game-header">
      <div className="header-players">
        {game.players.map((name, i) => (
          <div className="header-player" key={i}>
            <h2 className="header-name">{name}</h2>
            <div className="header-counts">
              <span>D: {caused(STATUS.DEATH, i)}</span>
              <span>M: {caused(STATUS.MISSED, i)}</span>
            </div>
          </div>
        ))}
      </div>
      <hr className="header-rule" />
    </header>
  );
}