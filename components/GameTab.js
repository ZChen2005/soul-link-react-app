import { Fragment, useEffect, useRef, useState } from "react";
import PokemonIcon from "./PokemonIcon.js";
import { STATUS_OPTIONS, displayName } from "./GameHelpers.js";

// Routes table: one pokeball per player on every row, plus the status dropdown.
export default function GameTab({
  game,
  routes,
  onBallClick,
  onStatus,
  onAddRoute,
  onMoveRoute,
  onDeleteRoute,
}) {
  const [newRoute, setNewRoute] = useState("");
  const [insertAfter, setInsertAfter] = useState(null); // route id with the insert form open
  const [insertName, setInsertName] = useState("");
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);
  const scrollRef = useRef(null);
  const pointerY = useRef(null);

  // While a route is being dragged, scroll the list when the pointer nears its top or bottom.
  useEffect(() => {
    if (dragId == null) return undefined;
    const EDGE = 70; // px from the edge where scrolling starts
    const MAX_SPEED = 18; // px per frame
    let frame;

    const track = (e) => {
      pointerY.current = e.clientY;
    };
    const tick = () => {
      const box = scrollRef.current;
      const y = pointerY.current;
      if (box && y != null) {
        const rect = box.getBoundingClientRect();
        if (y < rect.top + EDGE) {
          const closeness = Math.min(1, (rect.top + EDGE - y) / EDGE);
          box.scrollTop -= Math.ceil(MAX_SPEED * closeness);
        } else if (y > rect.bottom - EDGE) {
          const closeness = Math.min(1, (y - (rect.bottom - EDGE)) / EDGE);
          box.scrollTop += Math.ceil(MAX_SPEED * closeness);
        }
      }
      frame = requestAnimationFrame(tick);
    };

    document.addEventListener("dragover", track);
    frame = requestAnimationFrame(tick);
    return () => {
      document.removeEventListener("dragover", track);
      cancelAnimationFrame(frame);
      pointerY.current = null;
    };
  }, [dragId]);
  const columns = `minmax(120px, 1.4fr) repeat(${game.players.length}, minmax(70px, 1fr)) minmax(110px, 1fr) 104px`;

  function submit(e) {
    e.preventDefault();
    if (!newRoute.trim()) return;
    onAddRoute(newRoute.trim());
    setNewRoute("");
  }

  function submitInsert(e) {
    e.preventDefault();
    if (!insertName.trim()) return;
    onAddRoute(insertName.trim(), insertAfter);
    setInsertAfter(null);
    setInsertName("");
  }

  // Routes that already hold a status or a Pokemon ask before they are deleted.
  function removeRoute(route) {
    const hasData = route.status || route.pokemon.some((p) => p);
    if (hasData && !window.confirm(`Delete "${route.name}" and everything saved on it?`)) return;
    if (insertAfter === route.id) setInsertAfter(null);
    onDeleteRoute(route.id);
  }

  function openInsert(routeId) {
    setInsertAfter(insertAfter === routeId ? null : routeId);
    setInsertName("");
  }

  function endDrag() {
    setDragId(null);
    setOverId(null);
  }

  return (
    <div>
      <div className="table-head" style={{ gridTemplateColumns: columns }}>
        <span>Routes</span>
        {game.players.map((name, i) => (
          <span key={i} className="head-player" title={name}>
            {name}
          </span>
        ))}
        <span>Status</span>
        <span />
      </div>

      <div className="table-body">
        <div className="table-scroll" ref={scrollRef}>
        {routes.map((route) => (
          <Fragment key={route.id}>
          <div
            className={`table-row${dragId === route.id ? " dragging" : ""}${
              overId === route.id && dragId !== route.id ? " drop-target" : ""
            }`}
            style={{ gridTemplateColumns: columns }}
            onDragOver={(e) => {
              if (dragId == null) return;
              e.preventDefault();
              if (overId !== route.id) setOverId(route.id);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragId != null && dragId !== route.id) onMoveRoute(dragId, route.id);
              endDrag();
            }}
          >
            <span className="route-name">{route.name}</span>

            {route.pokemon.map((pokemon, i) => (
              <button
                type="button"
                key={i}
                className="ball-btn cell-ball"
                onClick={() => onBallClick(route.id, i)}
                aria-label={`${game.players[i]}, ${route.name}: ${
                  pokemon ? displayName(pokemon) || "Pokemon" : "add Pokemon"
                }`}
              >
                <PokemonIcon pokemon={pokemon} size={44} />
                <span className="cell-label">{displayName(pokemon)}</span>
              </button>
            ))}

            <select
              className="status-select"
              value={route.status}
              onChange={(e) => onStatus(route.id, e.target.value)}
              aria-label={`Status for ${route.name}`}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="row-tools">
              <span
                className="drag-handle"
                draggable
                role="img"
                aria-label={`Drag to move ${route.name}`}
                title="Drag to move"
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", route.id);
                  const row = e.currentTarget.closest(".table-row");
                  if (row) e.dataTransfer.setDragImage(row, 20, 20);
                  setDragId(route.id);
                }}
                onDragEnd={endDrag}
              >
                &#8942;&#8942;
              </span>
              <button
                type="button"
                className={`tool-btn${insertAfter === route.id ? " active" : ""}`}
                onClick={() => openInsert(route.id)}
                aria-label={`Insert a route below ${route.name}`}
                aria-expanded={insertAfter === route.id}
                title="Insert a route below"
              >
                +
              </button>
              <button
                type="button"
                className="tool-btn delete-btn"
                onClick={() => removeRoute(route)}
                aria-label={`Delete ${route.name}`}
                title="Delete route"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path
                    d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-3 6h12l-1 12H7L6 9Zm4 2v8h2v-8h-2Zm4 0v8h2v-8h-2Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          </div>

          {insertAfter === route.id && (
            <form className="insert-row" onSubmit={submitInsert}>
              <input
                type="text"
                autoFocus
                placeholder={`New route after ${route.name}`}
                aria-label="Name of the route to insert"
                value={insertName}
                onChange={(e) => setInsertName(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && setInsertAfter(null)}
              />
              <button type="submit" className="tab-btn">
                Insert
              </button>
              <button type="button" className="tab-btn" onClick={() => setInsertAfter(null)}>
                Cancel
              </button>
            </form>
          )}
          </Fragment>
        ))}

        {routes.length === 0 && (
          <p className="table-empty">
            {game.routes.length === 0
              ? "No routes yet. Add the first one below. After that, use the + button on a row to add more."
              : "Nothing matches your search."}
          </p>
        )}
        </div>

        {/* Only shown for a game with no routes at all; otherwise use the + buttons. */}
        {game.routes.length === 0 && (
        <form className="add-route" onSubmit={submit}>
          <input
            type="text"
            placeholder="New route name"
            aria-label="New route name"
            value={newRoute}
            onChange={(e) => setNewRoute(e.target.value)}
          />
          <button type="submit" className="tab-btn">
            Add route
          </button>
        </form>
        )}
      </div>
    </div>
  );
}