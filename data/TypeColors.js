// Badge colors for each Pokemon type (text colors chosen to stay readable).
const COLORS = {
  normal: ["#a8a77a", "#111111"],
  fire: ["#ee8130", "#111111"],
  water: ["#6390f0", "#111111"],
  electric: ["#f7d02c", "#111111"],
  grass: ["#7ac74c", "#111111"],
  ice: ["#96d9d6", "#111111"],
  fighting: ["#c22e28", "#ffffff"],
  poison: ["#a33ea1", "#ffffff"],
  ground: ["#e2bf65", "#111111"],
  flying: ["#a98ff3", "#111111"],
  psychic: ["#f95587", "#111111"],
  bug: ["#a6b91a", "#111111"],
  rock: ["#b6a136", "#111111"],
  ghost: ["#735797", "#ffffff"],
  dragon: ["#6f35fc", "#ffffff"],
  dark: ["#705746", "#ffffff"],
  steel: ["#b7b7ce", "#111111"],
  fairy: ["#d685ad", "#111111"],
};

export function typeStyle(type) {
  const [background, color] = COLORS[String(type).toLowerCase()] || ["#8c9aa8", "#111111"];
  return { background, color };
}
