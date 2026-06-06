import { teamColor } from "@/lib/teamColors";

// Drapeaux des nations britanniques (codes spécifiques flagcdn)
const SPECIAL: Record<string, string> = {
  ENG: "gb-eng",
  SCO: "gb-sct",
  WAL: "gb-wls",
};

export function flagUrl(code: string, width = 80): string {
  const cc = SPECIAL[code] ?? code.toLowerCase();
  return `https://flagcdn.com/w${width}/${cc}.png`;
}

// Drapeau rond cerclé de la couleur du pays. Vraie image (pas un emoji).
export default function TeamFlag({
  code,
  size = 32,
  ring = true,
  className = "",
}: {
  code: string | null | undefined;
  size?: number;
  ring?: boolean;
  className?: string;
}) {
  const style: React.CSSProperties = {
    width: size,
    height: size,
    boxShadow: ring ? `0 0 0 2px ${teamColor(code)}` : undefined,
  };

  if (!code) {
    return (
      <span
        className={`inline-grid shrink-0 place-items-center rounded-full bg-surface-2 text-muted ${className}`}
        style={style}
      >
        ?
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={flagUrl(code, size > 40 ? 160 : 80)}
      alt={code}
      width={size}
      height={size}
      loading="lazy"
      className={`inline-block shrink-0 rounded-full bg-surface-2 object-cover ${className}`}
      style={style}
    />
  );
}
