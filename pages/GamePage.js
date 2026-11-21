import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { forgetGame, getGame, isSynced, markSynced, rememberGame, saveGame } from "../storage.js";
import { cloudEnabled, cloudListen, cloudSaveNow, hasPendingCloudSave } from "../cloud/Cloud.js";
import { MAX_TEAM, STATUS, matchesSearch, newRoute, normalizeGame } from "../components/GameHelpers.js";
import GameHeader from "../components/GameHeader.js";
import TeamPanel from "../components/TeamPanel.js";
import GameTab from "../components/GameTab.js";
import BoxTab from "../components/BoxTab.js";
import GraveTab from "../components/GraveTab.js";
import PokemonDialog from "../components/PokemonDialog.js";
import CauseDialog from "../components/CauseDialog.js";
import ShareButton from "../cloud/ShareButton.js";
import "./GamePage.css";

const TABS = [
  { id: "game", label: "Game" },
  { id: "box", label: "Box" },
  { id: "grave", label: "Grave" },
];

export default function GamePage() {
  const { id } = useParams();
  const [game, setGame] = useState(() => {
    const saved = getGame(id);
    return saved ? normalizeGame(saved) : null;
  });
  const gameRef = useRef(game); // always the latest game, even inside async callbacks
  const [phase, setPhase] = useState(game ? "ready" : cloudEnabled ? "loading" : "missing");
  const [loadFailed, setLoadFailed] = useState(false);
  const [tab, setTab] = useState("game");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // { routeId, index }
  const [pendingCause, setPendingCause] = useState(null); // { routeId, status } waiting for a cause

  // Shared games: show the online copy and pick up changes other people make.
  useEffect(() => {
    if (!cloudEnabled) return undefined;
    return cloudListen(
      id,
      (remote) => {
        if (remote == null) {
          if (isSynced(id)) {
            // It was online before, so someone deleted it.
            forgetGame(id);
            gameRef.current = null;
            setGame(null);
            setPhase("deleted");
          } else if (gameRef.current) {
            // Never uploaded (made before sharing was set up): upload this browser's copy.
            markSynced(id);
            cloudSaveNow(gameRef.current);
          } else {
            setPhase("missing");
          }
          return;
        }
        if (!Array.isArray(remote.players)) {
          if (!gameRef.current) setPhase("missing");
          return;
        }
        if (hasPendingCloudSave(id)) return; // our own newer edits are about to be sent
        markSynced(id);
        const next = normalizeGame({ ...remote, id });
        setPhase("ready");
        if (JSON.stringify(next) === JSON.stringify(gameRef.current)) return;
        gameRef.current = next;
        setGame(next);
        rememberGame(next);
      },
      () => setLoadFailed(true)
    );
  }, [id]);

  if (!game) {
    return (
      <main className="screen game-screen">
        <Link className="back-link" to="/">
          <span aria-hidden="true">&larr;</span> Home
        </Link>
        <h1 className="game-missing">
          {loadFailed
            ? "Couldn't load this game. Check your connection and the Firebase setup."
            : phase === "loading"
            ? "Loading game..."
            : phase === "deleted"
            ? "This game was deleted."
            : "Game not found"}
        </h1>
      </main>
    );
  }

  // Apply a change, clean it up, keep it on screen and save it.
  function update(change) {
    const next = normalizeGame(change(gameRef.current));
    gameRef.current = next;
    setGame(next);
    saveGame(next);
  }

  function mapRoute(routeId, change) {
    update((g) => ({
      ...g,
      routes: g.routes.map((r) => (r.id === routeId ? change(r) : r)),
    }));
  }

  // Adds a route at the end, or right after `afterId` when given.
  const addRoute = (name, afterId) =>
    update((g) => {
      const route = newRoute(name, g.players.length);
      const at = afterId ? g.routes.findIndex((r) => r.id === afterId) : -1;
      const routes = [...g.routes];
      routes.splice(at < 0 ? routes.length : at + 1, 0, route);
      return { ...g, routes };
    });

  const deleteRoute = (routeId) =>
    update((g) => ({
      ...g,
      routes: g.routes.filter((r) => r.id !== routeId),
      team: g.team.filter((id) => id !== routeId),
    }));

  // Moves a route to where `targetId` currently is (works with a search filter active).
  const moveRoute = (routeId, targetId) =>
    update((g) => {
      const from = g.routes.findIndex((r) => r.id === routeId);
      const to = g.routes.findIndex((r) => r.id === targetId);
      if (from < 0 || to < 0 || from === to) return g;
      const routes = [...g.routes];
      const [moved] = routes.splice(from, 1);
      routes.splice(to, 0, moved);
      return { ...g, routes };
    });

  const setStatus = (routeId, status) => mapRoute(routeId, (r) => ({ ...r, status }));

  // Marking a route as Death or Missed first asks which player caused it.
  function requestStatus(routeId, status) {
    const route = gameRef.current.routes.find((r) => r.id === routeId);
    const needsCause = status === STATUS.DEATH || status === STATUS.MISSED;
    if (needsCause && route && route.status !== status) {
      setPendingCause({ routeId, status });
    } else {
      setStatus(routeId, status);
    }
  }

  function confirmCause(cause) {
    const { routeId, status } = pendingCause;
    mapRoute(routeId, (r) => {
      const next = { ...r, status };
      if (cause == null) delete next.cause;
      else next.cause = cause;
      return next;
    });
    setPendingCause(null);
  }

  const changePokemon = (routeId, index, pokemon) =>
    mapRoute(routeId, (r) => ({
      ...r,
      pokemon: r.pokemon.map((p, i) => (i === index ? pokemon : p)),
    }));

  const toggleTeam = (routeId) =>
    update((g) => {
      if (g.team.includes(routeId)) return { ...g, team: g.team.filter((t) => t !== routeId) };
      if (g.team.length >= MAX_TEAM) return g;
      return { ...g, team: [...g.team, routeId] };
    });

  const openEditor = (routeId, index) => setEditing({ routeId, index });

  const visible = (status) =>
    game.routes.filter((r) => (status ? r.status === status : true) && matchesSearch(r, search));

  const editingRoute = editing && game.routes.find((r) => r.id === editing.routeId);

  return (
    <main className="screen game-screen">
      <div className="game-topbar">
        <Link className="back-link" to="/">
          <span aria-hidden="true">&larr;</span> Home
        </Link>
        {cloudEnabled && <ShareButton />}
      </div>

      <GameHeader game={game} />

      <div className="game-layout">
        <TeamPanel game={game} onBallClick={openEditor} />

        <section className="game-main">
          <div className="tab-row">
            <div className="search">
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="m15 15 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                placeholder="Search"
                aria-label="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {TABS.map((t) => (
              <button
                type="button"
                key={t.id}
                className={`tab-btn${tab === t.id ? " active" : ""}`}
                aria-pressed={tab === t.id}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "game" && (
            <GameTab
              game={game}
              routes={visible()}
              onBallClick={openEditor}
              onStatus={requestStatus}
              onAddRoute={addRoute}
              onMoveRoute={moveRoute}
              onDeleteRoute={deleteRoute}
            />
          )}
          {/* A Pokemon only shows up in the box once its route is marked Captured. */}
          {tab === "box" && (
            <BoxTab
              game={game}
              routes={visible(STATUS.CAPTURED)}
              onBallClick={openEditor}
              onToggleTeam={toggleTeam}
              onKill={(routeId) => requestStatus(routeId, STATUS.DEATH)}
            />
          )}
          {tab === "grave" && <GraveTab game={game} routes={visible(STATUS.DEATH)} />}
        </section>
      </div>

      {editingRoute && (
        <PokemonDialog
          key={`${editing.routeId}-${editing.index}`}
          route={editingRoute}
          playerIndex={editing.index}
          players={game.players}
          inTeam={game.team.includes(editingRoute.id)}
          teamFull={game.team.length >= MAX_TEAM}
          onChange={(pokemon) => changePokemon(editing.routeId, editing.index, pokemon)}
          onSelectPlayer={(index) => setEditing({ routeId: editing.routeId, index })}
          onToggleTeam={() => toggleTeam(editing.routeId)}
          onGrave={() => {
            requestStatus(editing.routeId, STATUS.DEATH);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}

      {pendingCause && (
        <CauseDialog
          route={game.routes.find((r) => r.id === pendingCause.routeId)}
          status={pendingCause.status}
          players={game.players}
          onChoose={confirmCause}
          onCancel={() => setPendingCause(null)}
        />
      )}
    </main>
  );
}