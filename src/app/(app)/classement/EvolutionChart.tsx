type Series = { name: string; color: string; ranks: (number | null)[] };

// Graphique d'évolution des places (rang 1 en haut), SVG sans dépendance.
export default function EvolutionChart({
  dayLabels,
  series,
  maxRank,
}: {
  dayLabels: string[];
  series: Series[];
  maxRank: number;
}) {
  const W = 340;
  const H = 200;
  const padL = 26;
  const padR = 10;
  const padT = 12;
  const padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const n = dayLabels.length;

  const x = (i: number) => padL + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const y = (rank: number) =>
    padT + (maxRank <= 1 ? plotH / 2 : ((rank - 1) / (maxRank - 1)) * plotH);

  // Quels indices de jours afficher en label (évite la surcharge)
  const labelEvery = Math.ceil(n / 5);

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ minWidth: 280 }}
        role="img"
        aria-label="Évolution des places"
      >
        {/* Lignes horizontales + labels de rang */}
        {Array.from({ length: maxRank }, (_, k) => k + 1).map((r) => (
          <g key={r}>
            <line
              x1={padL}
              y1={y(r)}
              x2={W - padR}
              y2={y(r)}
              stroke="currentColor"
              strokeOpacity={0.12}
              strokeWidth={1}
            />
            <text
              x={padL - 5}
              y={y(r) + 3}
              textAnchor="end"
              fontSize={8}
              fill="currentColor"
              opacity={0.5}
            >
              {r}
            </text>
          </g>
        ))}

        {/* Labels de jours */}
        {dayLabels.map((d, i) =>
          i % labelEvery === 0 || i === n - 1 ? (
            <text
              key={i}
              x={x(i)}
              y={H - 8}
              textAnchor="middle"
              fontSize={8}
              fill="currentColor"
              opacity={0.5}
            >
              {d}
            </text>
          ) : null,
        )}

        {/* Une ligne par joueur */}
        {series.map((s, si) => {
          const segments: string[] = [];
          let cur: string[] = [];
          s.ranks.forEach((r, i) => {
            if (r == null) {
              if (cur.length) segments.push(cur.join(" "));
              cur = [];
            } else {
              cur.push(`${x(i)},${y(r)}`);
            }
          });
          if (cur.length) segments.push(cur.join(" "));
          return (
            <g key={si}>
              {segments.map((pts, k) => (
                <polyline
                  key={k}
                  points={pts}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {s.ranks.map((r, i) =>
                r == null ? null : (
                  <circle key={i} cx={x(i)} cy={y(r)} r={2.5} fill={s.color} />
                ),
              )}
            </g>
          );
        })}
      </svg>

      {/* Légende */}
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {series.map((s, i) => (
          <span key={i} className="flex items-center gap-1.5 text-xs">
            <span
              className="inline-block size-2.5 rounded-full"
              style={{ background: s.color }}
            />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}
