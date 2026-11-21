import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="screen home">
      <h1 className="home-title">Pokemon Soul Link Tracker</h1>
      <nav className="home-buttons" aria-label="Main menu">
        <Link className="outline-btn" to="/new">
          New Game
        </Link>
        <Link className="outline-btn" to="/load">
          Load Game
        </Link>
      </nav>
    </main>
  );
}
