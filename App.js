import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.js";
import NewGame from "./pages/NewGame.js";
import LoadGame from "./pages/LoadGame.js";
import GamePage from "./pages/GamePage.js";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/new" element={<NewGame />} />
      <Route path="/load" element={<LoadGame />} />
      <Route path="/game/:id" element={<GamePage />} />
    </Routes>
  );
}
