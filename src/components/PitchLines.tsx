// Lignes de terrain de foot très discrètes en fond (décoratif).
export default function PitchLines() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 text-foreground/[0.05]"
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 100 200"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
      >
        {/* Pourtour */}
        <rect x="6" y="6" width="88" height="188" rx="2" />
        {/* Ligne médiane */}
        <line x1="6" y1="100" x2="94" y2="100" />
        {/* Rond central */}
        <circle cx="50" cy="100" r="16" />
        <circle cx="50" cy="100" r="1.2" fill="currentColor" stroke="none" />
        {/* Surface du haut */}
        <rect x="28" y="6" width="44" height="24" />
        <rect x="40" y="6" width="20" height="9" />
        {/* Surface du bas */}
        <rect x="28" y="170" width="44" height="24" />
        <rect x="40" y="185" width="20" height="9" />
      </svg>
    </div>
  );
}
