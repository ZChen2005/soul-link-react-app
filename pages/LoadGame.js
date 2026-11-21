import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getGames, deleteGame } from "../storage.js";
import { cloudEnabled } from "../cloud/Cloud.js";

export default function LoadGame() {
  const navigate = useNavigate();
  const [games, setGames] = useState(getGames);

  async function handleDelete(game) {
    const message = cloudEnabled
      ? `Delete "${game.name}" for everyone? Anyone with its link will lose access too. This cannot be undone.`
      : `Delete "${game.name}"? This cannot be undone.`;
    if (!window.confirm(message)) return;
    const promise = deleteGame(game.id);
    setGames(getGames());
    if (!(await promise)) {
      window.alert(
        "The game was removed from this list, but its online copy could not be deleted. Check your connection and the Firestore rules."
      );
    }
  }

  return (
    <main className="screen">
      <Link className="back-link" to="/">
        <span aria-hidden="true">&larr;</span> Home
      </Link>

      <section className="panel">
        <h1 className="panel-title">Load Game</h1>

        {games.length === 0 ? (
          <p className="empty">No saved games yet.</p>
        ) : (
          <ul className="game-list">
            {games.map((game) => (
              <li className="game-row" key={game.id}>
                <span className="game-name">{game.name}</span>
                <div className="row-buttons">
                  <button
                    type="button"
                    className="light-btn"
                    onClick={() => navigate(`/game/${game.id}`)}
                  >
                    Load
                  </button>
                  <button type="button" className="light-btn" onClick={() => handleDelete(game)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}