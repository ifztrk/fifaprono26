import TeamFlag from "@/components/TeamFlag";

// Guirlande de drapeaux qui défile en continu (purement décoratif).
export default function FlagMarquee({ codes }: { codes: string[] }) {
  if (codes.length === 0) return null;
  const loop = [...codes, ...codes]; // 2 copies pour une boucle sans couture
  return (
    <div
      className="overflow-hidden rounded-full border border-border bg-surface/60 py-2"
      aria-hidden
    >
      <div className="marquee gap-2.5 px-2">
        {loop.map((code, i) => (
          <TeamFlag key={`${code}-${i}`} code={code} size={24} ring={false} />
        ))}
      </div>
    </div>
  );
}
