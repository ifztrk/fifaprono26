import { flagEmoji } from "@/lib/countries";

// Guirlande de drapeaux qui défile en continu (purement décoratif).
export default function FlagMarquee({ codes }: { codes: string[] }) {
  if (codes.length === 0) return null;
  const loop = [...codes, ...codes]; // 2 copies pour une boucle sans couture
  return (
    <div
      className="overflow-hidden rounded-full border border-border bg-surface/60 py-2"
      aria-hidden
    >
      <div className="marquee gap-3 px-2">
        {loop.map((code, i) => (
          <span key={`${code}-${i}`} className="text-xl leading-none">
            {flagEmoji(code)}
          </span>
        ))}
      </div>
    </div>
  );
}
