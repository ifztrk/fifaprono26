import confetti from "canvas-confetti";

const COLORS = [
  "#1fa463",
  "#f7c948",
  "#e23a4a",
  "#2a6fe0",
  "#ff8a1e",
  "#9d1a4a",
];

// Petite explosion festive (validation de pronos, score exact, etc.)
export function celebrate() {
  confetti({
    particleCount: 90,
    spread: 75,
    startVelocity: 42,
    origin: { y: 0.75 },
    colors: COLORS,
    disableForReducedMotion: true,
  });
  setTimeout(
    () =>
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.85 },
        colors: COLORS,
        disableForReducedMotion: true,
      }),
    120,
  );
  setTimeout(
    () =>
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.85 },
        colors: COLORS,
        disableForReducedMotion: true,
      }),
    120,
  );
}
