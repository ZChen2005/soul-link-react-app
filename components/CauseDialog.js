import PokemonIcon from "./PokemonIcon.js";
import { displayName } from "./GameHelpers.js";

// Asks which player caused a death or a miss before the route gets that status.
export default function CauseDialog({ route, status, players, onChoose, onCancel }) {
  const word = status === "death" ? "death" : "miss";
  return (
    <div
      className="overlay death-overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
      onKeyDown={(e) => e.key === "Escape" && onCancel()}
    >
      <div
        className="pdialog death-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`Cause of ${word}, ${route.name}`}
      >
        <h2 className="death-title">Who caused the {word}?</h2>
        <p className="pd-caption">{route.name}</p>

        <div className="death-choices">
          {players.map((name, i) => (
            <button
              type="button"
              key={i}
              className="death-choice"
              autoFocus={i === 0}
              onClick={() => onChoose(i)}
            >
              <PokemonIcon pokemon={route.pokemon[i]} size={44} />
              <strong>{name}</strong>
              <small>{displayName(route.pokemon[i]) || "—"}</small>
            </button>
          ))}
        </div>

        <div className="death-actions">
          <button type="button" className="pd-btn" onClick={() => onChoose(null)}>
            Not sure / skip
          </button>
          <button type="button" className="pd-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}