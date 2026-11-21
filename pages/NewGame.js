import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { REGIONS } from "../data/Regions.js";
import { addGame } from "../storage.js";
import { getPresetRoutes } from "../data/RoutePresets.js";
import { newRoute } from "../components/GameHelpers.js";

const MAX_PLAYERS = 10;
const MIN_PLAYERS = 2;

export default function NewGame() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [selectedGame, setSelectedGame] = useState(null); // { region, game }
  const [playerCount, setPlayerCount] = useState("3");
  const [playerNames, setPlayerNames] = useState({});
  const [error, setError] = useState("");

  // Number of "Player N" boxes to show (0 when the field is empty or invalid).
  const parsed = parseInt(playerCount, 10);
  const boxCount = Number.isNaN(parsed) ? 0 : Math.min(Math.max(parsed, 0), MAX_PLAYERS);

  function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim()) return setError("Please enter a game name.");
    if (!selectedGame) return setError("Please select the game you are playing.");
    if (boxCount < MIN_PLAYERS)
      return setError(`A Soul Link needs at least ${MIN_PLAYERS} players.`);

    const players = [];
    for (let i = 0; i < boxCount; i++) {
      const playerName = (playerNames[i] || "").trim();
      if (!playerName) return setError(`Please enter a name for Player ${i + 1}.`);
      players.push(playerName);
    }

    const id = Date.now().toString();
    addGame({
      id,
      name: name.trim(),
      region: selectedGame.region,
      game: selectedGame.game,
      players,
      routes: getPresetRoutes(selectedGame.game).map((route) => newRoute(route, players.length)),
      team: [],
      createdAt: new Date().toISOString(),
    });
    navigate(`/game/${id}`);
  }

  return (
    <main className="screen">
      <Link className="back-link" to="/">
        <span aria-hidden="true">&larr;</span> Home
      </Link>

      <form className="panel" onSubmit={handleSubmit} noValidate>
        <h1 className="panel-title">New Game</h1>

        <div className="field">
          <label htmlFor="game-name">Game Name</label>
          <input
            id="game-name"
            type="text"
            placeholder="Enter a name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <fieldset className="field region-field">
          <legend>Game</legend>
          <div className="region-table">
            {REGIONS.map((region) => (
              <div className="region-row" key={region.name}>
                <div className="region-name">{region.name}</div>
                <div className="region-games">
                  {region.games.map((game) => {
                    const checked =
                      selectedGame?.region === region.name && selectedGame?.game === game;
                    return (
                      <label className="game-option" key={game}>
                        <input
                          type="radio"
                          name="game"
                          checked={checked}
                          onChange={() => setSelectedGame({ region: region.name, game })}
                        />
                        <span>{game}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </fieldset>

        <div className="field">
          <label htmlFor="player-count">Number of Players</label>
          <input
            id="player-count"
            className="short-input"
            type="number"
            min={MIN_PLAYERS}
            max={MAX_PLAYERS}
            placeholder="3"
            value={playerCount}
            onChange={(e) => setPlayerCount(e.target.value)}
          />
        </div>

        {Array.from({ length: boxCount }, (_, i) => (
          <div className="field" key={i}>
            <label htmlFor={`player-${i}`}>Player {i + 1}</label>
            <input
              id={`player-${i}`}
              type="text"
              placeholder="Enter a name"
              value={playerNames[i] || ""}
              onChange={(e) => setPlayerNames({ ...playerNames, [i]: e.target.value })}
            />
          </div>
        ))}

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <div className="actions">
          <button type="submit" className="light-btn">
            Start Game
          </button>
        </div>
      </form>
    </main>
  );
}
