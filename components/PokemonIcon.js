import Pokeball from "./Pokeball.js";
import { pixelSprite } from "../data/Sprites.js";

// The Pokemon's pixel sprite once one is chosen, otherwise the placeholder pokeball.
export default function PokemonIcon({ pokemon, size, variant = "bright" }) {
  const src = pokemon && pokemon.dexId != null ? pixelSprite(pokemon.dexId) : "";
  if (src) {
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        style={{ display: "block", flex: "none", imageRendering: "pixelated" }}
      />
    );
  }
  return <Pokeball size={size} variant={variant} />;
}