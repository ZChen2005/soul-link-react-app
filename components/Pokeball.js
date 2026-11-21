// Placeholder pokeball. "muted" is the dark team-slot look, "bright" is the normal one.
export default function Pokeball({ variant = "bright", size = 56 }) {
  const top = variant === "bright" ? "#e53935" : "#8e2430";
  const bottom = variant === "bright" ? "#ffffff" : "#7d8a99";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", flex: "none" }}
    >
      <circle cx="50" cy="50" r="46" fill={bottom} />
      <path d="M4 50 A46 46 0 0 1 96 50 Z" fill={top} />
      <rect x="4" y="45" width="92" height="10" fill="#111" />
      <circle cx="50" cy="50" r="16" fill="#111" />
      <circle cx="50" cy="50" r="8" fill={bottom} />
      <circle cx="50" cy="50" r="46" fill="none" stroke="#111" strokeWidth="6" />
    </svg>
  );
}
